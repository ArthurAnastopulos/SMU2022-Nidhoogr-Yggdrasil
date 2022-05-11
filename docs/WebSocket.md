<h1 align="center"> Web Socket </h1>

<p align="left">
O WebSocket permite o streaming bidirecional e orientado a mensagens de texto e dados binários entre cliente e servidor. É a API mais próxima de um soquete de rede bruto no navegador. Exceto que uma conexão WebSocket também é muito mais do que um soquete de rede, pois o navegador abstrai toda a complexidade por trás de uma API simples e fornece vários serviços adicionais:

- Negociação de conexão e aplicação de política de mesma origem
- Interoperabilidade com a infraestrutura HTTP existente
- Comunicação orientada a mensagens e enquadramento de mensagens eficiente
- Negociação e extensibilidade de subprotocolos
</p>

<h2 align="center"> Tabela de Conteúdo </h2>

---

<p align="center">
 <a href="#websocket-api">WebSocket API</a> •
 <a href="#protocolo-webSocket">Protocolo WebSocket</a> •
 <a href="#casos-de-uso-e-desempenho">Casos de uso e desempenho</a> •
 <a href="#lista-de-verificação-de-desempenho">Lista de verificação de desempenho</a>
</p>

## WebSocket API

<p align="left">
A API WebSocket fornecida pelo navegador é notavelmente pequena e simples. Todos os detalhes de baixo nível de gerenciamento de conexão e processamento de mensagens são atendidos pelo navegador.

### WS e WSS URL Schemes

A URL do recurso WebSocket usa seu próprio schema personalizado: <i>ws</i> para comunicação de texto simples (por exemplo, ws://example.com/socket) e <i>wss</i> quando um canal criptografado (TCP+TLS) é necessário. Por que o esquema personalizado, em vez do familiar http?

O principal caso de uso do protocolo WebSocket é fornecer um canal de comunicação otimizado e bidirecional entre aplicativos executados no navegador e no servidor. No entanto, o protocolo de fio WebSocket pode ser usado fora do navegador e pode ser negociado por meio de uma troca não HTTP.

### Recebendo Texto e Dados Binários

A comunicação WebSocket consiste em mensagens e código do aplicativo e não precisa se preocupar com armazenamento em buffer, análise e reconstrução de dados recebidos. Por exemplo, se o servidor enviar uma carga útil de 1 MB, o retorno de chamada onmessage do aplicativo será chamado somente quando a mensagem inteira estiver disponível no cliente.

Além disso, o protocolo WebSocket não faz suposições e não impõe restrições à carga útil do aplicativo: tanto o texto quanto os dados binários são um jogo justo. Internamente, o protocolo rastreia apenas duas informações sobre a mensagem: o comprimento da carga útil como um campo de comprimento variável e o tipo de carga útil para distinguir UTF-8 de transferências binárias.

Quando uma nova mensagem é recebida pelo navegador, ela é automaticamente convertida em um objeto DOMString para dados baseados em texto ou um objeto Blob para dados binários e, em seguida, passada diretamente para o aplicativo.

### Envio de texto e dados binários

Uma vez que uma conexão WebSocket é estabelecida, o cliente pode enviar e receber mensagens UTF-8 e binárias à vontade.

A API WebSocket aceita um objeto DOMString, que é codificado como UTF-8 na transmissão, ou um dos objetos ArrayBuffer, ArrayBufferView ou Blob para transferências binárias. No entanto, observe que as últimas opções binárias são simplesmente uma conveniência da API: no fio, um quadro WebSocket é marcado como binário ou texto por meio de um único bit. Portanto, se o aplicativo ou o servidor precisar de outras informações de tipo de conteúdo sobre a carga útil, eles deverão usar um mecanismo adicional para comunicar esses dados.

O método `send()` é assíncrono: os dados fornecidos são enfileirados pelo cliente e a função retorna imediatamente. Como resultado, especialmente ao transferir grandes cargas úteis, não confunda o retorno rápido com um sinal de que os dados foram enviados.

O exemplo anterior tenta enviar atualizações de aplicativos para o servidor, mas somente se as mensagens anteriores tiverem sido drenadas do buffer do cliente. Por que se preocupar com tais verificações? Todas as mensagens do WebSocket são entregues na ordem exata em que são enfileiradas pelo cliente. Como resultado, uma grande lista de pendências de mensagens enfileiradas, ou mesmo uma única mensagem grande, atrasará a entrega de mensagens enfileiradas atrás dela – bloqueio de cabeçalho.

Para contornar esse problema, o aplicativo pode dividir mensagens grandes em partes menores, monitorar o valor bufferedAmount cuidadosamente para evitar o bloqueio de cabeçalho de linha e até mesmo implementar sua própria fila de prioridade para mensagens pendentes em vez de enfileirar todas cegamente no soquete.

### Negociação de subprotocolo

O protocolo WebSocket não faz suposições sobre o formato de cada mensagem: um único bit rastreia se a mensagem contém texto ou dados binários, de modo que possa ser decodificada eficientemente pelo cliente e pelo servidor, mas, caso contrário, o conteúdo da mensagem é opaco.

Além disso, ao contrário das solicitações HTTP ou XHR, que comunicam metadados adicionais por meio de cabeçalhos HTTP de cada solicitação e resposta, não existe um mecanismo equivalente para uma mensagem WebSocket. Como resultado, se forem necessários metadados adicionais sobre a mensagem, o cliente e o servidor devem concordar em implementar seu próprio subprotocolo para comunicar esses dados:

- O cliente e o servidor podem concordar com um formato de mensagem fixo antecipadamente - por exemplo, toda a comunicação será feita por meio de mensagens codificadas em JSON ou um formato binário personalizado, e os metadados de mensagem necessários farão parte da estrutura codificada.
- Se o cliente e o servidor precisarem transferir diferentes tipos de dados, eles podem concordar com um cabeçalho de mensagem consistente, que pode ser usado para comunicar as instruções para decodificar o restante da carga útil.
- A mix of text and binary messages can be used to communicate the payload and metadata information—e.g., a text message can communicate an equivalent of HTTP headers, followed by a binary message with the application payload.
<p>

## Protocolo WebSocket

<p align="left">
O protocolo de fio WebSocket (RFC 6455) desenvolvido pelo <i>HyBi Working Group</i> consiste em dois componentes de alto nível: o handshake HTTP de abertura usado para negociar os parâmetros da conexão e um mecanismo de framing de mensagem binária para permitir baixa sobrecarga, entrega baseada em mensagem de texto e dados binários.

O protocolo WebSocket é um protocolo autônomo totalmente funcional que pode ser usado fora do navegador. Dito isto, sua principal aplicação é como um transporte bidirecional para aplicativos baseados em navegador.
</p>

## Casos de uso e desempenho

<p align="left">
A API WebSocket fornece uma interface simples para transmissão bidirecional orientada a mensagens de texto e dados binários entre cliente e servidor: passe uma URL WebSocket para o construtor, configure algumas funções de retorno de chamada JavaScript e estamos prontos e funcionando - o resto é manipulado pelo navegador. Acrescente a isso o protocolo WebSocket, que oferece estrutura binária, extensibilidade e negociação de subprotocolos, e o WebSocket se torna perfeito para fornecer protocolos de aplicativos personalizados no navegador.

No entanto, assim como em qualquer discussão sobre desempenho, embora a complexidade de implementação do protocolo WebSocket esteja oculta do aplicativo, ela tem importantes implicações de desempenho sobre como e quando o WebSocket deve ser usado. O WebSocket não substitui o XHR ou o SSE e, para obter o melhor desempenho, é fundamental que aproveitemos os pontos fortes de cada transporte.
</p>

## Lista de verificação de desempenho

<p align="left">
A implantação de um serviço WebSocket de alto desempenho requer ajuste e consideração cuidadosos, tanto no cliente quanto no servidor. Uma pequena lista de critérios para colocar na agenda:

- Use WebSocket seguro (WSS sobre TLS) para implantações confiáveis.
- Preste muita atenção ao desempenho do polyfill (se necessário).
- Aproveite a negociação de subprotocolo para determinar o protocolo do aplicativo.
- Otimize as cargas binárias para minimizar o tamanho da transferência.
- Considere compactar o conteúdo UTF-8 para minimizar o tamanho da transferência.
- Defina o tipo binário correto para cargas binárias recebidas.
- Monitore a quantidade de dados armazenados em buffer no cliente.
- Divida mensagens de aplicativos grandes para evitar o bloqueio de cabeçalho.
- Aproveite outros transportes quando aplicável.
</o>