<h1 align="center">Especificação do Protocolo de Sinalização do Jogo</h1>

- Usar os mecanismos do [**Express JS**](https://expressjs.com/) para atender o modelo de requisição-resposta. 

- Usar os mecanismos do [**Socket.IO**](https://socket.io/) para estabelecimento de (`connection`) e encerramento (`disconnect`) de conexão. Para as mensagens do jogo.

- A mensagens (`connection`) e (`disconnect`), reservadas do Socket.IO, serão usadas para identificar quando um jogador entra ou sai da cena.

- A mensagem (`jogadores`), evento disparado pelo servidor a todos os jogadores quando algum jogador entra ou sai da partida (`connection` ou `disconnect`)

- A mensagem (`estadoDoJogador`) enviada por um jogador dispara um evento ao servidor, que por sua vez notifica o outro jogador para desenhar o oponente em tela.

- Usar os mecanismos do Socket.IO para a organização de [**sala**](https://socket.io/docs/v4/rooms/) (`join` e `leave`)

- Usar os mecanismos do NodeJS para gerar um valor aleatório para cada jogador ter um identificador único.

- Usar os mecanismos do Socket.IO para criação de [**sala**](https://socket.io/docs/v4/rooms/) utilizando os eventos de sala (`create-room`, `delete-room`, `join-room`, `leave-room`)

- Usar os mecanismos do [**Socket.IO P2P**](https://socket.io/) para configurar uma conexão WebRTC entre peers e comunique-se usando o protocolo socket.io, assim fazendo o encapsulamento de um protocolo de negociação e descrição de mídia para que o navegador consiga negociar caminhos (Rede, Transporte), mídias e codecs (Aplicação).