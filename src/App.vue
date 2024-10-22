<template>
  <div id="app">
    <h1>Chat App</h1>

    <div v-if="!isLoggedIn">
      <button @click="showLogin = true">Login</button>
      <button @click="showLogin = false">Register</button>

      <div v-if="showLogin">
        <h2>Login</h2>
        <input v-model="loginEmail" placeholder="Email" type="email" />
        <input v-model="loginPassword" placeholder="Password" type="password" />
        <button @click="login">Login</button>
      </div>

      <div v-else>
        <h2>Register</h2>
        <input v-model="registerEmail" placeholder="Email" type="email" />
        <input v-model="registerPassword" placeholder="Password" type="password" />
        <button @click="register">Register</button>
      </div>
    </div>

    <div v-else>
      <h2>Chat</h2>
      <div class="chat-container" ref="chatContainer">
        <div v-for="message in sortedMessages" :key="message.id" class="message">
          <strong>{{ message.user }}:</strong> <span>{{ message.text }}</span>
        </div>
      </div>
      <input v-model="newMessage" placeholder="Type a message" />
      <button @click="sendMessage">Send</button>
      <button @click="logout">Logout</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { auth, db } from './firebase';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

export default {
  setup() {
    const isLoggedIn = ref(false);
    const showLogin = ref(true);
    const registerEmail = ref('');
    const registerPassword = ref('');
    const loginEmail = ref('');
    const loginPassword = ref('');
    const newMessage = ref('');
    const messages = ref([]);
    const chatContainer = ref(null);

    const register = async () => {
      try {
        await createUserWithEmailAndPassword(auth, registerEmail.value, registerPassword.value);
        registerEmail.value = '';
        registerPassword.value = '';
      } catch (error) {
        console.error("Error registering:", error);
      }
    };

    const login = async () => {
      try {
        await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
        isLoggedIn.value = true;
        loginEmail.value = '';
        loginPassword.value = '';
      } catch (error) {
        console.error("Error logging in:", error);
      }
    };

    const logout = async () => {
      await signOut(auth);
      isLoggedIn.value = false;
    };

    const sendMessage = async () => {
      if (newMessage.value.trim() === '') return;

      try {
        await addDoc(collection(db, 'messages'), {
          text: newMessage.value,
          user: auth.currentUser.email,
          timestamp: new Date(),
        });
        newMessage.value = ''; 
      } catch (error) {
        console.error("Error sending message:", error);
      }
    };

    onMounted(() => {
      onSnapshot(collection(db, 'messages'), (snapshot) => {
        messages.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      });
    });

    // Сортируем сообщения по времени
    const sortedMessages = computed(() => {
      return messages.value.slice().sort((a, b) => a.timestamp - b.timestamp);
    });

    // Прокручиваем вниз при обновлении сообщений
    watch(sortedMessages, () => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
      }
    });

    return {
      isLoggedIn,
      showLogin,
      registerEmail,
      registerPassword,
      loginEmail,
      loginPassword,
      newMessage,
      messages,
      sortedMessages,
      chatContainer, 
      register,
      login,
      logout,
      sendMessage,
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}

.chat-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  height: 400px;
  overflow-y: auto;
}

.message {
  margin: 10px 0;
  padding: 10px;
  border-radius: 5px;
  background-color: #e1f5fe;
  text-align: left;
}

h2 {
  margin-bottom: 10px;
}

input {
  padding: 10px;
  margin: 5px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px 15px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
