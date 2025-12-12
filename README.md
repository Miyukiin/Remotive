<a id="readme-top"></a>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#key-features">Key Features</a></li>
        <li><a href="#tech-stack-and-architecture">Tech Stack and Architecture</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

Remotive is a modern, real-time project management platform designed to increase team efficiency and productivity. Built on a powerful Next.js and serverless architecture, it delivers instant, multi-user collaboration and deep analytical insights for teams managing complex workflows.

This project serves as my take on the ideal platform for modern team collaboration, leveraging cutting-edge web technologies to provide a seamless and interactive user experience.

<!--[![Product Name Screen Shot][product-screenshot]](https://example.com) -->
Built using [Next.js](https://nextjs.org/) with the App Router, styled using [Tailwind CSS](https://tailwindcss.com/), enhanced with accessible UI components from [shadcn/ui](https://ui.shadcn.com/), and featuring [Clerk](https://clerk.com/), [Pusher.js](https://pusher.com/docs/channels/getting_started/javascript/), **[dnd-kit](https://dndkit.com/)** and many more! It is engineered for instant collaboration, secure authentication, and a high-performance user experience, delivering a culminative project management software. Hosted in [Vercel](http://remotive-eight.vercel.app/)!

The application allows teams to effectively manage:
- **Tasks**
- **Projects**
- **Teams**
- **Kanban Boards**

### ✨ Key Features

- **⚡ Real-Time Collaboration:** Powered by **Pusher.js**, changes, updates, and comments sync instantly so everyone stays aligned.
- **✅ Tasks Management:** Organize projects into clear tasks with deadlines, priorities, and etc..
- **👥 Teams and Projects Management:** Supports tasks management, teams management, and projects management.
- **➡️ Drag and Drop Kanban:** Easily manage workflows with a modern Kanban board, powered by **dnd-kit**, and gain the ability to drag and drop tasks and columns for interactivity.
- **📊 Rich Analytics:** Gain deep insights with report analytics. Track productivity, project progress, and team performance through intuitive dashboards.
- **🗓️ Calendar View:** Visualize tasks and deadlines on a familiar calendar interface. Perfect for planning sprints, meetings, and deliverables.
- **🔒 Secure Authentication:** Utilizes **Clerk** for robust, secure user authentication and management.

### 🛠️ Tech Stack and Architecture

The application is built with a modern, full-stack JavaScript ecosystem designed for scalability and performance.

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend/Backend** | Next.js (App Router) | Full-stack framework for server-side rendering, API routes, and Server Components. |
| **Real-Time** | Pusher.js | Enables instant multi-user collaboration and live synchronization of data. |
| **Authentication** | Clerk | Secure authentication and user management. |
| **Drag and Drop** | **dnd-kit** | Highly performant, modern React drag and drop library for Kanban board implementation. |
| **Database** | Neon (PostgreSQL) | Serverless, fully managed PostgreSQL database for data persistence. |
| **ORM/Query Builder** | Drizzle ORM | TypeScript ORM/query builder for type-safe and efficient database interactions. |
| **State Management** | Tanstack React Query, Zustand | Data fetching, caching, and global state management for a responsive UI. |
| **Deployment** | Vercel | High-performance, serverless deployment platform. |

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running follow these steps.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Miyukiin/Remotive.git
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd remotive-project
    ```
3.  **Install dependencies:**
    ```sh
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
4.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory and add the necessary variables for Clerk and Pusher.js, along with your Neon database connection string. An `.env.example` has been provided for your reference.
    ```env
    # Database
    DATABASE_URL='[Your Neon DB Connection String]'

    # Clerk Authentication
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY='...'
    CLERK_SECRET_KEY='...'

    # Pusher Real-time
    NEXT_PUBLIC_PUSHER_APP_KEY='...'
    NEXT_PUBLIC_PUSHER_CLUSTER='...'
    PUSHER_APP_ID='...'
    PUSHER_SECRET='...'
    ```
5.  **Run Migrations (if applicable):**
    If you are using Drizzle migrations, run the following commands.
    ```sh
    npx drizzle-kit generate
    npx drizzle-kit migrate
    ```
6.  **Run the development server:**
    ```sh
    npm run dev
    ```
7.  Open your browser and visit the site:
    ```sh
    http://localhost:3000
    ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License
Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/othneildrew/Best-README-Template.svg?style=for-the-badge
[contributors-url]: https://github.com/othneildrew/Best-README-Template/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/othneildrew/Best-README-Template.svg?style=for-the-badge
[forks-url]: https://github.com/othneildrew/Best-README-Template/network/members
[stars-shield]: https://img.shields.io/github/stars/othneildrew/Best-README-Template.svg?style=for-the-badge
[stars-url]: https://github.com/othneildrew/Best-README-Template/stargazers
[issues-shield]: https://img.shields.io/github/issues/othneildrew/Best-README-Template.svg?style=for-the-badge
[issues-url]: https://github.com/othneildrew/Best-README-Template/issues
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/othneildrew/Best-README-Template/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/othneildrew
[product-screenshot]: images/screenshot.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 
