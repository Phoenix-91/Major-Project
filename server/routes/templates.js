const express = require('express');
const router = express.Router();
const { requireAuth, extractUserId } = require('../middleware/auth');
const Template = require('../models/Template');

router.use(requireAuth);
router.use(extractUserId);

// Get all templates for user
router.get('/', async (req, res, next) => {
    try {
        const templates = await Template.find({ userId: req.userId })
            .sort({ createdAt: -1 });
        res.json(templates);
    } catch (error) {
        next(error);
    }
});

// Create new template
router.post('/', async (req, res, next) => {
    try {
        const { name, subject, body, category, variables } = req.body;

        const template = new Template({
            userId: req.userId,
            name,
            subject,
            body,
            category,
            variables
        });

        await template.save();
        res.status(201).json(template);
    } catch (error) {
        next(error);
    }
});

// Update template
router.put('/:id', async (req, res, next) => {
    try {
        const { name, subject, body, category, variables } = req.body;

        const template = await Template.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            {
                name,
                subject,
                body,
                category,
                variables,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        res.json(template);
    } catch (error) {
        next(error);
    }
});

// Delete template
router.delete('/:id', async (req, res, next) => {
    try {
        const template = await Template.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
