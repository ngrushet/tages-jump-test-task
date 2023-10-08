const axios = require('axios').default

const instance = axios.create({
    baseURL: 'http://jsonplaceholder.typicode.com/',
    timeout: 1000,
});

interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    address: {
        street: string;
        suite: string;
        city: string;
        zipcode: string;
        geo: {
            lat: string;
            lng: string;
        };
    };
    phone: string;
    website: string;
    company: {
        name: string;
        catchPhrase: string;
        bs: string;
    };
}

interface Comment {
    postId: number;
    id: number;
    name: string;
    email: string;
    body: string;
}

interface FinalPost {
    id: number,
    title: string,
    title_crop: string,
    body: string,
    comments?: Array<Comment>
}

// Функция для получения списка постов
async function getPosts(params?: {
    userId?: number,
    _limit?: number
}): Promise<Array<Post>> {
    try {
        const response = await instance.get('posts', { params });
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении списка постов:', error);
        return [];
    }
}

// Функция для получения списка пользователей
async function getUsers(params?: {
    id?: number,
    _limit?: number
}): Promise<Array<User>> {
    try {
        const response = await instance.get('users', { params });
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении списка пользователей:', error);
        return [];
    }
}

// функция для получения комментариев
async function getComments(params?: {
    postId?: number,
    id?: number,
    name?: string
}): Promise<Array<Comment>> {
    try {
        const response = await instance.get('comments', { params });
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении списка пользователей:', error);
        return [];
    }
}

// Функция для формирования итогового массива пользователей
async function getUsersMergedPosts(offset?: number) {
    const posts = await getPosts();
    const users = await getUsers({ _limit: offset });
    const comments = await getComments();

    const finalUsers = users.map((user) => {
        const address = `${user.address.city}, ${user.address.street}, ${user.address.suite}`;

        const userPosts = posts
            .filter((post) => post.userId === user.id)
            .map((post) => {
                const croppedTitle = post.title.length > 20 ? post.title.slice(0, 20) + '...' : post.title;

                const finalPost: FinalPost = {
                    id: post.id,
                    title: post.title,
                    title_crop: croppedTitle,
                    body: post.body
                };

                if (user.name === "Ervin Howell") {
                    finalPost.comments = comments.filter(
                        (comment) => (comment.postId === post.id)
                    );
                }

                return finalPost;
            });

        const finalUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            address: address,
            website: 'https://' + user.website,
            company: user.company.name,
            posts: userPosts,
        };
        return finalUser;
    });
    return finalUsers;
}

// Вызов функции и вывод итогового массива пользователей в консоль
getUsersMergedPosts()
    .then((finalUsers) => console.log(JSON.stringify(finalUsers)))
    .catch((error) => console.error('Ошибка:', error));