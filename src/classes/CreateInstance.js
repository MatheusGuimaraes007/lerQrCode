class CreateInstance {
  constructor(instanceName) {
    this.instanceName = instanceName;
    this.model = 'WHATSAPP-BAILEYS';
    this.qrcode = true;
    this.apikey = 'cbfd5e372f4f2e9ccc72a05e29eb18fd';
  }

  async create() {
    try {
      const response = await fetch(
        'https://evo.sinapseautomacoes.com.br/instance/create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: this.apikey,
          },
          body: JSON.stringify({
            instanceName: this.instanceName,
            qrcode: this.qrcode,
            integration: this.model,
          }),
        },
      );
      const json = await response.json();
      return json;
    } catch (err) {
      return err;
    }
  }

  async getInstance() {
    try {
      const response = await fetch(
        `https://evo.sinapseautomacoes.com.br/instance/connect/${this.instanceName}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            apikey: this.apikey,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const json = await response.json();
      return json;
    } catch (err) {
      console.error('Erro ao conectar à instância:', err);
      return err;
    }
  }
}

export default CreateInstance;
