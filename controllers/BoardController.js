const { randomUUID } = require('node:crypto');
const { mkdir, readFile, readdir, rename, rmdir, stat, unlink, writeFile } = require('node:fs/promises');
const path = require('node:path');
const jwt = require('jsonwebtoken');

const imageDirectory = path.join(__dirname, '..', 'uploads', 'board');
const legacyImagePath = path.join(imageDirectory, 'fullscreen-image');
const imageIdPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;
const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function getImageType(image) {
    if (image.subarray(0, pngSignature.length).equals(pngSignature)) return 'image/png';
    if (image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff) return 'image/jpeg';
    if (image.toString('ascii', 0, 4) === 'RIFF' && image.toString('ascii', 8, 12) === 'WEBP') {
        return 'image/webp';
    }
    return null;
}

async function readImageList() {
    const entries = await readdir(imageDirectory, { withFileTypes: true }).catch(error => {
        if (error.code === 'ENOENT') return [];
        throw error;
    });
    const images = await Promise.all(entries.map(async entry => {
        try {
            if (entry.isDirectory() && imageIdPattern.test(entry.name)) {
                const metadata = await readFile(path.join(imageDirectory, entry.name, 'metadata.json'), 'utf8');
                const { name, uploadedAt } = JSON.parse(metadata);
                return { id: entry.name, name, uploadedAt };
            }
            if (entry.isFile() && entry.name === 'fullscreen-image') {
                const file = await stat(legacyImagePath);
                return { id: 'legacy', name: 'รูปแนบเดิม', uploadedAt: file.mtime.toISOString() };
            }
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
        }
        return null;
    }));
    return images.filter(Boolean).sort((first, second) =>
        second.uploadedAt.localeCompare(first.uploadedAt) || first.id.localeCompare(second.id));
}

async function removeImageDirectory(directory) {
    for (const file of ['image', 'metadata.json']) {
        await unlink(path.join(directory, file)).catch(error => {
            if (error.code !== 'ENOENT') throw error;
        });
    }
    await rmdir(directory).catch(error => {
        if (error.code !== 'ENOENT') throw error;
    });
}

module.exports = {
    imageTypes,

    authorizeImageChange(req, res, next) {
        const token = /^Bearer\s+(\S+)$/i.exec(req.get('Authorization') || '')?.[1];
        const secret = process.env.SECRET_KEY;
        if (!secret) return res.status(500).json({ message: 'missing_SECRET_KEY' });
        if (!token) return res.status(401).json({ message: 'unauthorized' });

        try {
            jwt.verify(token, secret, { algorithms: ['HS256'] });
        } catch {
            return res.status(401).json({ message: 'unauthorized' });
        }

        next();
    },

    async uploadImage(req, res) {
        if (!req.is(imageTypes)) return res.status(415).json({ message: 'unsupported_image_type' });
        const image = req.body;
        if (!Buffer.isBuffer(image) || image.length === 0) {
            return res.status(400).json({ message: 'missing_image' });
        }
        const type = getImageType(image);
        if (!type || !req.is(type)) return res.status(415).json({ message: 'unsupported_image_type' });

        let name;
        try {
            const originalName = decodeURIComponent(req.get('X-Image-Name') || '');
            name = originalName.split(/[\\/]/).pop().trim().slice(0, 255) || `image.${type.split('/')[1]}`;
        } catch {
            return res.status(400).json({ message: 'invalid_image_name' });
        }

        const id = randomUUID();
        const temporaryPath = path.join(imageDirectory, `.upload-${id}`);
        try {
            await mkdir(imageDirectory, { recursive: true });
            await mkdir(temporaryPath);
            await writeFile(path.join(temporaryPath, 'image'), image);
            await writeFile(path.join(temporaryPath, 'metadata.json'), JSON.stringify({
                name, uploadedAt: new Date().toISOString(),
            }));
            await rename(temporaryPath, path.join(imageDirectory, id));
        } catch (error) {
            await removeImageDirectory(temporaryPath).catch(cleanupError => {
                console.error('Board image upload cleanup failed:', cleanupError.code);
            });
            console.error('Board image upload failed:', error.code);
            return res.status(500).json({ message: 'image_upload_failed' });
        }
        return res.status(204).end();
    },

    async listImages(req, res) {
        res.set('Cache-Control', 'no-store');
        try {
            return res.json({ images: await readImageList() });
        } catch (error) {
            console.error('Board image list failed:', error.code);
            return res.status(500).json({ message: 'image_list_failed' });
        }
    },

    async getImage(req, res) {
        res.set('Cache-Control', 'no-store');
        try {
            const id = req.params.id ?? (await readImageList())[0]?.id;
            if (id !== 'legacy' && !imageIdPattern.test(id ?? '')) {
                return res.status(404).json({ message: 'image_not_found' });
            }
            const imagePath = id === 'legacy' ? legacyImagePath : path.join(imageDirectory, id, 'image');
            const image = await readFile(imagePath);
            const type = getImageType(image);
            if (!type) return res.status(500).json({ message: 'image_read_failed' });

            res.set('X-Content-Type-Options', 'nosniff');
            return res.type(type).send(image);
        } catch (error) {
            if (error.code === 'ENOENT') return res.status(404).json({ message: 'image_not_found' });
            console.error('Board image read failed:', error.code);
            return res.status(500).json({ message: 'image_read_failed' });
        }
    },

    async deleteImage(req, res) {
        const id = req.params.id;
        if (id !== 'legacy' && !imageIdPattern.test(id)) {
            return res.status(404).json({ message: 'image_not_found' });
        }

        try {
            if (id === 'legacy') {
                await unlink(legacyImagePath);
            } else {
                const removedPath = path.join(imageDirectory, `.deleted-${randomUUID()}`);
                await rename(path.join(imageDirectory, id), removedPath);
                await removeImageDirectory(removedPath).catch(error => {
                    console.error('Board image delete cleanup failed:', error.code);
                });
            }
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('Board image delete failed:', error.code);
                return res.status(500).json({ message: 'image_delete_failed' });
            }
        }
        return res.status(204).end();
    },

    handleImageUploadError(error, req, res, next) {
        if (res.headersSent) return next(error);
        if (error.status === 413) return res.status(413).json({ message: 'image_too_large' });
        if (error.status === 415) return res.status(415).json({ message: 'unsupported_image_type' });
        return next(error);
    },
};
