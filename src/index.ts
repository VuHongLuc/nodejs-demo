import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// Tạo một user mới
app.post('/user', async (req, res) => {
    try {
        const { name, age } = req.body;

        const user = await prisma.user.create({
            data: {
                name: name,
                age: age,
            },
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

// Lấy danh sách tất cả users
app.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

// Lay thong tin cua 1 user cu the
app.get('/user/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: {id: id},
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong.' });
    }
})

//Update thong tin user
app.put('/update-user/:id' , async (req, res) => {
    const { id } = req.params;
    const { name, age } = req.body;
    try {
        const updateUser = await prisma.user.update({
            data: {
                name,
                age,
            },
            where: {id},
        })

        res.json(updateUser);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong.' });
    }
})

//Xoa 1 user
app.delete('/delete-user/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await prisma.user.delete({
            where: {id},
        })

        res.json(deletedUser);
    } catch (error) {
        
    }
})

app.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000`);
});
