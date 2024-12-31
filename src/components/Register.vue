<script setup>
import logo from '../assets/logo.png';
import { createClient } from '@supabase/supabase-js'
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import router from '../router';

const url = 'https://hdmjywfgmczhhqeanspr.supabase.co'
const secretKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkbWp5d2ZnbWN6aGhxZWFuc3ByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDczNzU3MywiZXhwIjoyMDUwMzEzNTczfQ.m7MyEoPhYqSH5Te2GOnjOGkQWLYouv0cAaZ4ZB-hq7k'
const supabase = createClient(url, secretKey)

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const userRegister = async () => {
  const {data: searchEmail, error: emailError} = await supabase.from('user').select().eq('email', email.value)
  if (emailError) {
    console.error('Erro ao verificar e-mail:', emailError.message);
    alert('Erro ao verificar o e-mail.');
    return;
  }
  if (searchEmail && searchEmail.length > 0) {
    alert('E-mail já cadastrado, tente outro.');
    return;
  }
    if (password.value !== confirmPassword.value) {
    alert(`senha: ${password} | senha confirmada: ${confirmPassword}`);
    return
  }
  const {data, error} = await supabase.from('user').insert({
    name: name.value,
    email: email.value,
    access_key: password.value
  })
  if (error) {
    alert('Erro ao registrar usuário');
    return
  }
  router.push('/')
}

</script>

<template>
  <section class="w-full h-auto flex flex-col items-center justify-start min-h-screen">
    <div class="p-2 w-[60%] sm:w-[40%] md:w-[25%]">
      <img :src="logo">
    </div>
    <div class="bg-white w-[80%] md:w-[40%] h-full flex flex-col justify-center items-center rounded-lg mb-8">
      <form action="" @submit.prevent="userRegister" class="flex flex-col justify-center items-center w-[90%]">
        <span class="text-black text-[26px] font-bold font-sans mb-6 text-center">Faça seu registro abaixo</span>
        <label for="name" class="text-black self-start">Nome</label>
        <input type="text" id="name" v-model="name" required class="h-10 bg-[#141c4d] p-2 rounded-lg w-full text-white">
        <label for="email" class="text-black self-start mt-2">Email</label>
        <input type="email" id="email" v-model="email" required class="h-10 bg-[#141c4d] p-2 rounded-lg w-full text-white">
        <label for="password" class="text-black self-start mt-2">Senha</label>
        <input type="password" id="password" v-model="password" required class="h-10 bg-[#141c4d] p-2 rounded-lg w-full text-white">
        <label for="confirmPassword" class="text-black self-start mt-2">Confirme sua senha</label>
        <input type="password" id="confirmPassword" required v-model="confirmPassword" class="h-10 bg-[#141c4d] p-2 rounded-lg w-full text-white">
        <input type="submit" class="text-black bg-[#00d1ff] font-bold px-10 py-3 mt-7 rounded-md text-[20px] cursor-pointer" value="Cadastrar">
      </form>
      <router-link to="/" class="underline mt-4 mr-5 text-[16px] self-end mb-2">
        Fazer Login
      </router-link>
    </div>
  </section>
  <component :is="currentView" />
</template>
