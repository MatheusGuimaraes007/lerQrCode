<script setup>
import logo from '../assets/logo.png';
import { createClient } from '@supabase/supabase-js'
import { ref } from 'vue';
import router from '../router';

const url = 'https://hdmjywfgmczhhqeanspr.supabase.co'
const secretKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkbWp5d2ZnbWN6aGhxZWFuc3ByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDczNzU3MywiZXhwIjoyMDUwMzEzNTczfQ.m7MyEoPhYqSH5Te2GOnjOGkQWLYouv0cAaZ4ZB-hq7k'
const supabase = createClient(url, secretKey)

const email = ref('');
const password = ref('');

const userLogin = async () => {
  const {data, error} = await supabase.from('user').select().eq('email', email.value)

  if(data.length < 1) {
    alert('Email não cadastrado')
    return
  } else if(data.length > 0) {
    if(data[0].access_key != password.value) {
      alert('Senha Incorreta')
      return
    }
  } 
  document.cookie = `userId=${data[0].id}; path=/; max-age=${60 * 60 * 24};`;
  document.cookie = `userName=${data[0].name}; path=/; max-age=${60 * 60 * 24}`;

  router.push('/home')
}

</script>

<template>
  <section class="w-full h-auto flex flex-col items-center justify-start min-h-screen">
    <div class="p-2 w-[60%] sm:w-[40%] md:w-[25%]">
      <img :src="logo">
    </div>
    <div class="bg-white md:w-[40%]  w-[80%] h-96 flex flex-col justify-center items-center rounded-lg">
      <form action="" @submit.prevent="userLogin" class="flex flex-col justify-center items-center w-[90%]">
        <span class="text-balck text-[26px] font-bold font-sans mb-6 text-center">Entre agora e acesse seu QR code!</span>
        <label for="email" class="text-black self-start">Email</label>
        <input type="text" id="email" v-model="email" required class="h-10 bg-[#141c4d] p-2 rounded-lg w-full text-white">
        <label for="password" class="text-black self-start mt-4">Senha</label>
        <input type="password" id="password" v-model="password" required class="h-10 bg-[#141c4d] p-2 rounded-lg w-full text-white">
        <input type="submit" class="text-black bg-[#00d1ff] font-bold px-10 py-3 mt-7 rounded-md text-[20px]" value="Entrar">
      </form>
      <router-link to="/register" class="underline mt-4 mr-5 text-[16px] self-end">
        Realizar Cadastro
      </router-link>
    </div>
  </section>
  <component :is="currentView" />
</template>
