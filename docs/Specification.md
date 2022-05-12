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

<h2 align="center">Registro do Cliente no Servidor</h2>

----

Todas as mensagens enviadas no protocolo de sinalização irão utilizar o formato json, similar à especificação de [JSON-RPC](https://www.jsonrpc.org/specification). Sempre que um cliente requisistar algo ao servidor, é enviado um json, contendo cabeçalho e corpo da requisição.

O cabeçalho da requisição contém apenas o método a ser invocado, Register por exemplo. O Corpo da requisição é um objeto que contém os parâmetros dos métodos. Por exemplo, no Cliente:

```Json
{
	"metodo": "join-room",
	"params": {
		"name": "nome",
		"room": "id-sala"  
	}
}
```

Já o servidor retorna uma resposta a requisição do Cliente, também em json. Por exemplo:

```Json
{
	  "response": "ok",
    "Token": "identificadoroken",
    "codigo": 200
}
```

- **CASO 1**: Mecanismo de quando o Cliente registra a presença na sala e o Servidor permite:
```Json
{
	"metodo": "join-room",
	"params": {
		"name": "nome",
		"room": "id-sala"  
	}
}
```
```Json
{
	  "response": "ok",
    "Token": " identificador",
    "codigo": 200
}
```

- **CASO 2**: Mecanismo de quando o Cliente registrando a presença na sala e o Serivodr não permite devido ao nome do usuário (incorreto ou duplicado):
```Json
{
	"metodo": "join-room",
	"params": {
		"name": "nome",
		"room": "id-sala"  
	}
}
```
```Json
{
	  "response": "not ok",
    "codigo": 400
}
```

- **CASO 3**: Mecanismo de quando o Cliente registra a presença na sala e o Servidor não permite devido a sala estar cheia:
```Json
{
	"metodo": "join-room",
	"params": {
		"name": "nome",
		"room": "id-sala"  
	}
}
```
```Json
{
	  "response": "not ok",
    "codigo": 402
}
```

- **CASO 4**: KeepAlive, como mensagem periódica para manter a conexão:

```Json
{
	"metodo": "connection",
	"params": {
		"Token": "identificador",  
	}
}
```
```Json
{
	  "response": "ok",
    "codigo": 201
}
```

- **Caso 5**: Conexão encerrada:
```Json
{
	"metodo": "disconnect",
	"params": {
		"Token": "identificador",  
	}
}
```
```Json
{
	  "response": "ok",
    "codigo": 202
}
```

## Observações:

- No caso de um jogador perder a conexão, ao entrar na sala novamente ele terá um novo (`Token`).

- No caso de um jogador entrar em outra sala, o mesmo jogador terá um (`Token`) diferente para cada sala.

<h2 align="center">Códigos de Respostas</h2>

---

- **200**: ok para o registro
- **201**: ok para o KeepAlive
- **202**: ok para desconexão de encerramento
- **400**: usuário duplicado
- **401**: usuário incorreto, por exemplo ( " " ou ";:\|?/") )
- **402**: sala cheia
