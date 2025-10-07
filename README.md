# 📱 CIS Application — Mobile Social Platform for CIS Students

**นางสาวอรปรียา จันทะโคตร 653450107-5**

CIS is a mobile social app designed for **Computer and Information Science (CIS)** students.  
It helps members connect, share updates, and explore community activities with ease.  
All post, member, and profile data are fetched via our REST API.

---

## ✨ Features

| Feature               | Description                                                          |
| --------------------- | -------------------------------------------------------------------- |
| 🏠 **Home Feed**      | Browse recent posts and updates from other members, fetched via API. |
| 👥 **Members**        | Discover and connect with fellow CIS members through API data.       |
| 👤 **Profile**        | View and edit your personal profile via API requests.                |
| ❤️ **Like System**    | Like and unlike posts in real time (API-backed).                     |
| 💬 **Comments**       | Engage in discussions below posts, saved through API.                |
| 🔐 **Authentication** | Secure login and token-based authentication using API.               |

> **API Base URL:** `https://cis.kku.ac.th/api/classroom`

---

## 🖼️ App Preview

### 🏠 Home Screen

<table>
<tr>
<td><img src="/assets/image-application/home.jpeg" width="200" /></td>
<td><img src="/assets/image-application/ready-to-post.jpeg" width="200" /></td>
<td><img src="/assets/image-application/comment.jpeg" width="200" /></td>
</tr>
</table>

### 👥 Members Screen

<img src="/assets/image-application/member.jpeg" width="250" />

### 👤 Profile Screen

<img src="/assets/image-application/myprofile.jpeg" width="250" />

---

## 🧩 Tech Stack

- ⚛️ **React Native (Expo)**
- 🔥 **Firebase Authentication & Firestore**
- 💅 **Custom UI with StyleSheet**
- 💾 **AsyncStorage** for local user session
- 📡 **API Integration** (`https://cis.kku.ac.th/api/classroom`) for posts, likes, comments, and profile

---

## ⚙️ Installation

```bash
# Clone this repository
git clone https://github.com/Onpreeya-Jantakote/cis-application.git
cd cis-application

# Install dependencies
npm install

# Run the app
npm start
```
