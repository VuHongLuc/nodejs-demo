import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// Tạo một user mới
app.post('/users', async (req, res) => {
    try {
        const { name, age } = req.body;

        const user = await prisma.user.create({
            data: {
                name,
                age,
            },
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

// Lay danh sach user cung voi post tuong ung cho tung user
app.get('/users', async (req, res) => {
    try {
        // Lay ra thong tin tren query param
        const { page = 1, limit = 2 } = req.query;

        // Parse `page` va `limit` tren query param tha`nh number
        const pageNumber = parseInt(page as string, 10);
        const pageSize = parseInt(limit as string, 10);

        const offset = (pageNumber - 1) * pageSize;
        const [users, totalUsers] = await Promise.all(
            [
                prisma.user.findMany(
                    {
                        skip: offset,       // Bo qua cac ban ghi truoc do
                        take: pageSize,     // Lay so luong ban ghi theo gioi han
                        select: {          // Lay danh sach post cho tung user tuong ung
                            posts: true,
                        },
                    }
                ),
                prisma.user.count()
            ])

        res.json({
            totalUsers,
            totalPages: Math.ceil(totalUsers / pageSize),
            currentPage: pageNumber,
            users,
        });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

// Lay thong tin cua 1 user cu the kem theo tong so luong Post cua user do
app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const users= await prisma.user.findUnique({
            where: {id},
            include : {
                posts: true,
            }
        });

        const totalPosts = users?.posts.length;

        res.json({users, totalPosts});
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong.' });
    }
})

// Update thong tin user
app.put('/users/:id' , async (req, res) => {
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

// Xoa 1 user
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await prisma.user.delete({
            where: {id},
        })

        res.json(deletedUser);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong.' });
    }

})

// Doi ten user va bai post dau tien cua user do
app.put('/user/:id/update-name', async (req, res) => {
    const { id } = req.params;
    const { newName, newPostTitle } = req.body;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // Doi ten user
            const updateUser = await tx.user.update({
                where: {id},
                data: {
                    name: newName
                }
            })

            // Tim kiem bai post dau tien
            const findFirstPost = await tx.post.findFirst({
                where: {
                    userId: id
                }
            })

            //Neu khong tim thay bai post dau tien thi se thoat khoi try-catch block
            if(!findFirstPost) throw new Error('User has no posts');

            // Doi ten bai viet dau tien
            const updateFirstPost = tx.post.update({
                data :{
                    title: newPostTitle,
                },
                where :{
                    id: findFirstPost.id
                }
            })

            return { updateUser, updateFirstPost };
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

// Tim kiem bai post theo title, theo userId
app.get('/posts/search', async (req, res) => {
    const { title, userId } = req.query;

    // tim kiem theo ca title va userId cung 1 luc
    const conditional = {
        ...(title && {title : title as string}),
        ...(userId && {userId : userId as string}),
    }

    try {
        const searchedPost = await prisma.post.findMany({
            where: conditional
        })
        res.json(searchedPost);
        
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong.' });
    }
} )


app.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000`);
});
