import connectDB from '../config/database.js';
import User from '../models/User.js';
import Thread from '../models/Thread.js';
import Reply from '../models/Reply.js';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Thread.deleteMany({});
    await Reply.deleteMany({});

    console.log('Database cleared');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@threadapp.com',
      password: 'admin123',
      role: 'admin',
      badges: ['admin', 'moderator'],
      avatarUrl: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=A'
    });

    await adminUser.save();
    console.log('Admin user created');

    // Create demo users
    const demoUsers = [
      {
        username: 'alice',
        email: 'alice@example.com',
        password: 'password123',
        badges: ['early-adopter'],
        avatarUrl: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=A'
      },
      {
        username: 'bob',
        email: 'bob@example.com',
        password: 'password123',
        badges: ['contributor'],
        avatarUrl: 'https://via.placeholder.com/150/45B7D1/FFFFFF?text=B'
      },
      {
        username: 'charlie',
        email: 'charlie@example.com',
        password: 'password123',
        badges: ['verified'],
        avatarUrl: 'https://via.placeholder.com/150/96CEB4/FFFFFF?text=C'
      }
    ];

    const createdUsers = [];
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`User ${user.username} created`);
    }

    // Create demo threads
    const demoThreads = [
      {
        title: 'Welcome to ThreadApp!',
        content: 'This is our first thread. Feel free to introduce yourself and start discussions about topics you\'re passionate about.',
        topic: 'general',
        author: {
          _id: adminUser._id,
          username: adminUser.username,
          avatarUrl: adminUser.avatarUrl
        }
      },
      {
        title: 'Best programming languages in 2024',
        content: 'What do you think are the most promising programming languages this year? I\'m particularly interested in Rust, Go, and TypeScript.',
        topic: 'technology',
        author: {
          _id: createdUsers[0]._id,
          username: createdUsers[0].username,
          avatarUrl: createdUsers[0].avatarUrl
        }
      },
      {
        title: 'AI and the future of work',
        content: 'How do you think AI will change the job market in the next 5-10 years? Will it create more opportunities or replace many jobs?',
        topic: 'technology',
        author: {
          _id: createdUsers[1]._id,
          username: createdUsers[1].username,
          avatarUrl: createdUsers[1].avatarUrl
        }
      },
      {
        title: 'Favorite books of 2024',
        content: 'Share your favorite books you\'ve read this year! I\'m always looking for new recommendations.',
        topic: 'books',
        author: {
          _id: createdUsers[2]._id,
          username: createdUsers[2].username,
          avatarUrl: createdUsers[2].avatarUrl
        }
      }
    ];

    const createdThreads = [];
    for (const threadData of demoThreads) {
      const thread = new Thread(threadData);
      await thread.save();
      createdThreads.push(thread);
      console.log(`Thread "${thread.title}" created`);
    }

    // Create demo replies
    const demoReplies = [
      {
        threadId: createdThreads[0]._id,
        content: 'Hi everyone! I\'m excited to be part of this community. Looking forward to great discussions!',
        author: {
          _id: createdUsers[0]._id,
          username: createdUsers[0].username,
          avatarUrl: createdUsers[0].avatarUrl
        }
      },
      {
        threadId: createdThreads[0]._id,
        content: 'Welcome! This looks like a great platform for meaningful conversations.',
        author: {
          _id: createdUsers[1]._id,
          username: createdUsers[1].username,
          avatarUrl: createdUsers[1].avatarUrl
        }
      },
      {
        threadId: createdThreads[1]._id,
        content: 'I think Rust is definitely gaining momentum, especially for systems programming. The memory safety without garbage collection is a game-changer.',
        author: {
          _id: createdUsers[2]._id,
          username: createdUsers[2].username,
          avatarUrl: createdUsers[2].avatarUrl
        }
      },
      {
        threadId: createdThreads[1]._id,
        content: 'TypeScript has been my go-to for web development. The type safety makes large codebases much more manageable.',
        author: {
          _id: adminUser._id,
          username: adminUser.username,
          avatarUrl: adminUser.avatarUrl
        }
      },
      {
        threadId: createdThreads[2]._id,
        content: 'AI will definitely automate many routine tasks, but I believe it will also create new types of jobs we haven\'t even imagined yet.',
        author: {
          _id: createdUsers[0]._id,
          username: createdUsers[0].username,
          avatarUrl: createdUsers[0].avatarUrl
        }
      },
      {
        threadId: createdThreads[3]._id,
        content: 'I just finished "The Midnight Library" by Matt Haig. It\'s a beautiful exploration of life\'s infinite possibilities.',
        author: {
          _id: createdUsers[1]._id,
          username: createdUsers[1].username,
          avatarUrl: createdUsers[1].avatarUrl
        }
      }
    ];

    for (const replyData of demoReplies) {
      const reply = new Reply(replyData);
      await reply.save();
      console.log(`Reply by ${reply.author.username} created`);
    }

    // Update thread reply counts
    for (const thread of createdThreads) {
      await thread.updateReplyCount();
    }

    console.log('Seed data created successfully!');
    console.log('\nDemo accounts:');
    console.log('Admin: admin@threadapp.com / admin123');
    console.log('User 1: alice@example.com / password123');
    console.log('User 2: bob@example.com / password123');
    console.log('User 3: charlie@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
