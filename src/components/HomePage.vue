<script setup>
import { getCookies } from '../utils/cookies';
import router from '../router';
import { ref, onMounted } from 'vue';
import CreateInstance from '../classes/CreateInstance';
import { createClient } from '@supabase/supabase-js';

const url = 'https://hdmjywfgmczhhqeanspr.supabase.co';
const secretKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkbWp5d2ZnbWN6aGhxZWFuc3ByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDczNzU3MywiZXhwIjoyMDUwMzEzNTczfQ.m7MyEoPhYqSH5Te2GOnjOGkQWLYouv0cAaZ4ZB-hq7k';
const supabase = createClient(url, secretKey);

const bucketName = 'images';
const imageUrl = ref('');
const countdown = ref(40); // 40 segundos
const showQrCode = ref(false); // Controla se o QR code será exibido
const checkingState = ref(false); // Indica se está verificando o estado da instância
const isConnected = ref(false); // Indica se a instância está conectada
const uploadStatus = ref('');
const buttonText = ref('Gerar QR code'); // Texto do botão
const intervalId = ref(null);

const userId = getCookies('userId');
const userName = getCookies('userName');
const userInstance = getCookies('userInstance')

if (!userId || !userName) {
  router.push('/');
}

console.log('Nome da instância:', userInstance);

const checkInstanceState = async (instance) => {
  try {
    const response = await instance.getInstance();

    // Verifica se a resposta possui a propriedade `state` e se está aberta
    if (response?.instance?.state === 'open') {
      return true; // Instância conectada
    }

    // Caso a propriedade `state` não exista ou não seja 'open'
    if (!response?.instance?.state) {
      return false;
    }

    return false; // Não conectada ou state inexistente
  } catch (error) {
    console.error('Erro ao verificar estado da instância:', error);
    return false; // Em caso de erro, considera como não conectada
  }
};

const onLoadCheckInstance = async () => {
  const instance = new CreateInstance(userInstance);
  const connectionState = await checkInstanceState(instance);

  if (connectionState) {
    isConnected.value = true;
    uploadStatus.value = 'Instância já conectada!';
  }
};

const createInstance = async () => {
  const randomNumber = Math.floor(Math.random() * 101);
  const nameInstance = `${userName}_${userId}_${randomNumber}`;
  document.cookie = `userInstance=${nameInstance}; path=/; max-age=${60 * 60 * 24 * 30 * 6};`
  const instance = new CreateInstance(nameInstance);

  buttonText.value = 'Carregando QR code...'; // Atualiza o texto do botão
  const resultCreate = await instance.create();
  let base64Image = resultCreate.qrcode?.base64;
  if (!base64Image) {
    alert('Algo deu errado, entre com contato com o suporte!');
    buttonText.value = 'Gerar QR code';
    return;
  }

  const base64ToBlob = (base64) => {
    const base64Data = base64.split(',')[1];
    const binaryData = atob(base64Data);
    const arrayBuffer = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      arrayBuffer[i] = binaryData.charCodeAt(i);
    }
    return new Blob([arrayBuffer], { type: 'image/png' });
  };

  try {
    uploadStatus.value = 'Carregando...';
    const blob = base64ToBlob(base64Image);
    const fileName = `qrcode_${Date.now()}.png`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, blob);

    if (error) {
      console.error('Erro no upload:', error.message);
      uploadStatus.value = 'Erro ao carregar a imagem.';
      buttonText.value = 'Gerar QR code';
      return;
    }

    const { data: publicData, error: publicError } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    if (publicError) {
      console.error('Erro ao obter URL pública:', publicError.message);
      buttonText.value = 'Gerar QR code';
      return;
    }

    imageUrl.value = publicData.publicUrl;
    uploadStatus.value = 'Imagem carregada com sucesso.';
    showQrCode.value = true;

    // Inicia o cronômetro e a verificação de conexão
    startCountdown(fileName, instance);
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    uploadStatus.value = 'Erro ao carregar a imagem.';
    buttonText.value = 'Gerar QR code';
  }
};

const startCountdown = (fileName, instance) => {
  countdown.value = 40;
  checkingState.value = true;

  intervalId.value = setInterval(async () => {
    countdown.value -= 1;

    // Verifica se a instância está conectada
    const connectionState = await checkInstanceState(instance);
    if (connectionState) {
      clearInterval(intervalId.value);
      removeQrCode(fileName);
      checkingState.value = false;
      isConnected.value = true;
      uploadStatus.value = 'Instância já conectada!';
    }

    if (countdown.value === 0) {
      clearInterval(intervalId.value);
      removeQrCode(fileName);
      checkingState.value = false;
      buttonText.value = 'Gerar QR code'; // Redefine o botão
    }
  }, 1000);
};

const removeQrCode = async (fileName) => {
  showQrCode.value = false;
  uploadStatus.value = 'Removendo QR code...';
  try {
    const { error } = await supabase.storage.from(bucketName).remove([fileName]);
    if (error) {
      console.error('Erro ao remover arquivo:', error.message);
      uploadStatus.value = 'Erro ao remover o QR code.';
      return;
    }
    uploadStatus.value = 'QR code removido com sucesso.';
    buttonText.value = 'Gerar QR code';
  } catch (err) {
    console.error('Erro ao remover arquivo:', err);
    uploadStatus.value = 'Erro ao remover o QR code.';
    buttonText.value = 'Gerar QR code';
  }
};

// Executa a verificação inicial quando a página é carregada
onMounted(() => {
  onLoadCheckInstance();
});
</script>

<template>
  <section class="flex flex-col justify-center items-center">
    <div class="flex flex-col justify-center items-center mt-10">
      <span class="text-white text-xl">Bem-vindo, {{ userName }}</span>
      <span class="text-white" v-if="!isConnected">Siga as instruções abaixo para ler o QR code</span>
      <span class="text-green-500 text-lg" v-else>Instância já conectada!</span>
    </div>
    <div class="mt-10 w-[80%]">
      <ul v-if="!isConnected && !showQrCode && !checkingState" class="flex flex-col justify-center items-start gap-2">
        <li class="text-white">1. Abra o WhatsApp Business no seu celular.</li>
        <li class="text-white">2. Toque nos <span class="font-bold">três pontos no canto superior direito</span> da tela.</li>
        <li class="text-white">3. Selecione a opção <span class="underline font-bold">"Dispositivos Conectados"</span>.</li>
        <li class="text-white">4. Toque em <span class="font-bold">"Conectar um dispositivo"</span>.</li>
        <li class="text-white">5. Clique no botão <span class="underline font-bold">"Gerar QR Code" abaixo</span>.</li>
        <li class="text-white">6. Aponte a câmera do celular para o QR Code exibido e faça a leitura.</li>
      </ul>
      <div v-if="showQrCode" class="flex flex-col items-center mt-5">
        <img :src="imageUrl" alt="QR Code" class="mb-5" />
        <span class="text-white mb-10">O QR code será removido em {{ countdown }} segundos.</span>
      </div>
      <div v-if="checkingState" class="text-center mt-5">
        <span class="text-white">Verificando conexão... ({{ countdown }}s)</span>
      </div>
      <div v-else-if="!showQrCode && !isConnected" class="flex justify-center items-center">
        <button @click="createInstance" class="bg-green-500 px-10 py-3 text-white rounded-xl mt-10">
          {{ buttonText }}
        </button>
      </div>
    </div>
  </section>
</template>
