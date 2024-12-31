import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../components/Login.vue';
import RegisterPage from '../components/Register.vue';
import HomePage from '../components/HomePage.vue';

const routes = [
  { path: '/', name: 'Login', component: LoginPage }, // Página inicial
  { path: '/register', name: 'Register', component: RegisterPage }, // Página de cadastro
  { path: '/home', name: 'Home', component: HomePage },
];

const router = createRouter({
  history: createWebHistory(), // Navegação baseada em hash
  routes,
});

export default router;
