# DevTinder Backend 🚀

## 📌 Overview

DevTinder is a **MERN stack** web application designed to help developers **connect and collaborate**, similar to Tinder but specifically for developers. Users can create profiles, explore other developers, send connection requests, and manage their matches.

This repository contains the **backend** of DevTinder, built with **Node.js, Express, and MongoDB**, following a **microservices architecture** for scalability.

> ⚠️ **Note:** The backend is **fully functional** and ready for further scaling and optimizations.

---

## 🛠️ Tech Stack

- **Backend Framework**: [Node.js](https://nodejs.org/en) + [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
- **Authentication**: [JWT (JSON Web Tokens)](https://jwt.io/) + Cookies
- **Encryption**: [bcryptjs](https://www.npmjs.com/package/bcryptjs) for password hashing
- **API Testing**: Postman
- **Environment Variables Management**: dotenv
- **Package Manager**: npm

---

## 🔑 Features Implemented

### **1. Authentication System**

✅ User Signup, Login, and Logout  
✅ JWT-based authentication with secure cookies  
✅ Password encryption using **bcryptjs**  
✅ Authentication middleware to protect routes

### **2. User Profile Management**

✅ View user profile  
✅ Edit profile details (restricted fields for security)  
✅ Update password with validation

### **3. Connection Request System**

✅ Send connection requests (`Interested` or `Ignored`)  
✅ Accept or reject received requests  
✅ Prevent duplicate requests using MongoDB validation  
✅ Prevent self-requests using Mongoose `.pre` middleware

### **4. Feed API & Pagination**

✅ Fetch suggested developers while excluding:

- Logged-in user
- Existing connections
- Ignored users
- Users with pending requests  
  ✅ Implemented **pagination** using `skip` & `limit`  
  ✅ Optimized query using **MongoDB $nin and $ne operators**

### **5. Database Design**

✅ **User Schema**:

- Sanitized input fields (`trim`, `lowercase`, validation)
- Unique constraints on email and username

✅ **ConnectionRequest Schema**:

- `fromUserId`, `toUserId`, `status` with **enum validation**
- Indexed fields for optimized queries
- Prevents multiple requests between the same users

### **6. Advanced Query Optimization**

✅ **Indexes & Compound Indexes**:

- Used `index: true` for faster queries
- Implemented compound indexes to optimize search

### **7. Middleware Implementation**

✅ **Authentication Middleware**: Protects private routes  
✅ **Error Handling Middleware**: Centralized error response  
✅ **Mongoose `.pre` Middleware**: Prevents self-requests

### **8. Express Router Structure**

✅ Modular route organization for maintainability  
✅ APIs structured into separate routers (`auth`, `profile`, `connections`, `users`)

---

## 🚀 API Endpoints

### **1️⃣ Authentication Routes**

| Method | Endpoint       | Description                        | Auth Required |
| ------ | -------------- | ---------------------------------- | ------------- |
| POST   | `/auth/signup` | Register a new user                | ❌            |
| POST   | `/auth/login`  | Authenticate user & issue JWT      | ❌            |
| POST   | `/auth/logout` | Logout user by clearing JWT cookie | ✅            |

---

### **2️⃣ User Profile Routes**

| Method | Endpoint            | Description                   | Auth Required |
| ------ | ------------------- | ----------------------------- | ------------- |
| GET    | `/profile/view`     | Get logged-in user profile    | ✅            |
| PATCH  | `/profile/edit`     | Update allowed profile fields | ✅            |
| PATCH  | `/profile/password` | Update user password          | ✅            |

---

### **3️⃣ Connection Request Routes**

| Method | Endpoint                             | Description                                    | Auth Required |
| ------ | ------------------------------------ | ---------------------------------------------- | ------------- |
| POST   | `/request/send/:status/:toUserId`    | Send a connection request (Interested/Ignored) | ✅            |
| POST   | `/request/review/:status/:requestId` | Accept/Reject a request                        | ✅            |
| GET    | `/user/requests/received`            | Fetch pending connection requests              | ✅            |
| GET    | `/user/connections`                  | Fetch accepted connections                     | ✅            |

---

### **4️⃣ Feed API & Pagination**

| Method | Endpoint                     | Description                                      | Auth Required |
| ------ | ---------------------------- | ------------------------------------------------ | ------------- |
| GET    | `/user/feed?page=1&limit=10` | Get suggested developer profiles with pagination | ✅            |

---

## 🏗️ Setup & Running the Server

### **1️⃣ Clone the Repository**

```bash
git clone https://github.com/harshmann10/DevTinder-backend.git
cd DevTinder-backend
```

### **2️⃣ Set Up Environment Variables**

Create a `.env` file and add:

```ini
DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/devTinder
ALLOWED_ORIGIN=http://localhost:5173
JWT_SECRET=your_jwt_secret
PORT=7777
```

### **3️⃣ Start the Backend Server**

```bash
npm start
```

Server runs at: `http://localhost:7777/`

---

### AWS Deployment Guide (EC2 + Nginx)

This guide explains how to deploy the full MERN stack (frontend and backend) on a single AWS EC2 instance using Nginx as a web server and reverse proxy.

**Prerequisites:**

- An AWS account.
- The [DevTinder-frontend](https://github.com/harshmann10/DevTinder-frontend) has been built (`npm run build`).
- You have launched an Ubuntu EC2 instance and can connect to it via SSH.
- Node.js, npm, and Nginx are installed on the instance.

---

#### **Step 1: Deploy Frontend Files**

1.  On your local machine, build the React frontend:
    ```sh
    # In the frontend project directory
    npm run build
    ```
2.  Copy the contents of the `dist` folder from your local machine to the Nginx web root on your EC2 instance. You can use `scp` for this.
    ```sh
    # Replace paths and IP address accordingly
    scp -i /path/to/your-key.pem -r /path/to/frontend/dist/* ubuntu@your-ec2-public-ip:/var/www/html/
    ```

---

#### **Step 2: Deploy Backend Application**

1.  **Clone and Setup Backend on EC2:**
    Connect to your EC2 instance and clone the backend repository.

    ```sh
    git clone https://github.com/harshmann10/DevTinder-backend.git
    cd DevTinder-backend
    npm install
    ```

2.  **Configure Environment Variables:**
    Create and edit the `.env` file.

    ```sh
    nano .env
    ```

    Add your configuration. `PORT` must be `7777` to match the Nginx config later. `ALLOWED_ORIGIN` should be your server's domain or IP.

    ```ini
    DATABASE_URL=your_mongodb_connection_string
    ALLOWED_ORIGIN=http://your-ec2-public-ip
    JWT_SECRET=a_very_strong_and_secret_key
    PORT=7777
    ```

3.  **Configure MongoDB Atlas Firewall:**
    In your MongoDB Atlas dashboard, go to **Network Access** and add the public IP address of your EC2 instance to the IP Access List. This allows your server to connect to the database.

---

#### **Step 3: Run Backend with PM2**

PM2 is a process manager that will keep your Node.js application running in the background.

1.  **Install PM2 Globally:**

    ```sh
    sudo npm install pm2 -g
    ```

2.  **Start the Application:**
    Start the server using PM2 and give it a descriptive name.

    ```sh
    pm2 start npm --name "devtinder-api" -- start
    ```

3.  **Enable Startup on Reboot:**
    To ensure your app restarts automatically if the server reboots:

    ```sh
    pm2 startup
    ```

    (This will output a command. Copy and run that command to register PM2 as a startup service).

    ```sh
    pm2 save
    ```

4.  **Useful PM2 Commands:**
    - `pm2 logs devtinder-api`: View real-time logs.
    - `pm2 status`: Check the status of your app.
    - `pm2 restart devtinder-api`: Restart the app.

---

#### **Step 4: Configure Nginx**

Nginx will serve your frontend and act as a reverse proxy for your backend API. This setup allows both to be accessible from the same domain/IP.

1.  **Edit the Default Nginx Configuration:**

    ```sh
    sudo nano /etc/nginx/sites-available/default
    ```

2.  **Replace the File Content:**
    Use the following configuration. It serves the React app and forwards any request starting with `/api` to your backend running on port `7777`.

    ```nginx
    server {
        listen 80 default_server;
        listen [::]:80 default_server;

        root /var/www/html;
        index index.html index.htm;

        server_name your_domain.com or your-ec2-public-ip;

        # Handle frontend routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Handle backend API proxy
        location /api/ {
            proxy_pass http://localhost:7777/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

3.  **Restart Nginx:**
    Test the configuration and then restart the Nginx service to apply the changes.
    ```sh
    sudo nginx -t
    sudo systemctl restart nginx
    ```

> **⚠️ Important:**  
> In your frontend `.env` file, set `VITE_BACKEND_URL=/api`  
> This ensures all API requests are correctly proxied through Nginx to your backend.

Your application should now be live at your EC2 instance's public IP address.

---

## 🔗 Frontend Integration

The frontend for DevTinder is available at:
🔗 **[DevTinder Frontend Repository](https://github.com/harshmann10/DevTinder-frontend)**

Make sure the backend is running before accessing the frontend.

---

## Learning Resources

Explore my additional repositories to deepen your understanding of related topics in the JavaScript ecosystem:

- [Namaste Javascript](https://github.com/akshadjaiswal/Namaste-Javascript) : A repository focused on learning Javascript concepts, from basics to advanced programming.
- [Chai aur React](https://github.com/hiteshchoudhary/chai-aur-react) : A repository dedicated to mastering React.js, covering foundational and advanced aspects of building interactive UIs.

---

## 📢 Contribution Guidelines

Since the project is now fully functional, improvements are still welcome!
✅ Feel free to open issues for bugs or feature requests.  
✅ Fork the repository and submit a pull request.

---

## 📌 Future Enhancements

🔹 Real-time notifications using WebSockets  
🔹 Messaging System for better user interaction  
🔹 Profile Search & Filtering  
🔹 Unit Testing for API reliability

---

## 📜 License

This project is open-source and available under the **MIT License**.

---
