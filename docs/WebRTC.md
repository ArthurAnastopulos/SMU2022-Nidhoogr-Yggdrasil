<h1 align="center"> WebRTC </h1>

<p align="left">
Web Real-Time Communication (WebRTC) é uma coleção de padrões, protocolos e APIs JavaScript, cuja combinação permite o compartilhamento de áudio, vídeo e dados ponto a ponto entre navegadores (pares). Em vez de depender de plug-ins de terceiros ou software proprietário, o WebRTC transforma a comunicação em tempo real em um recurso padrão que qualquer aplicativo da Web pode aproveitar por meio de uma API JavaScript simples.

Fornecer aplicativos RTC ricos e de alta qualidade, como teleconferência de áudio e vídeo e troca de dados ponto a ponto, requer muitas novas funcionalidades no navegador: recursos de processamento de áudio e vídeo, novas APIs de aplicativos e suporte para meia dúzia de novos protocolos de rede. Felizmente, o navegador abstrai a maior parte dessa complexidade por trás de três APIs principais:

- MediaStream: aquisição de fluxos de áudio e vídeo
- RTCPeerConnection: comunicação de dados de áudio e vídeo
- RTCDataChannel: comunicação de dados de aplicativos arbitrários
</p>

<h2 align="center"> Tabela de Conteúdo </h2>

---

<!--ts-->
   * [Padrões e Desenvolvimento de WebRTC](#padroes-e-desenvolvimento-de-webrtc)
   * [Engine de áudio e vídeo](#engine-de-audio-e-video)
   * [Transportes de rede em tempo real](#transportes-de-rede-em-tempo-real)
   * [Estabelecendo uma conexão ponto a ponto](#estabelecendo-uma-conexao-ponto-a-ponto)
   * [Entregando dados de mídia e aplicativos](#entregando-dados-de-mídia-e-aplicativos)
   * [DataChannel](#datachannel)
   * [Casos de uso e desempenho do WebRTC](#casos-de-uso-e-desempenho-do-webrtc)
   * [Lista de verificação de desempenho](#lista-de-verificacao-de-desempenho)
<!--te-->

## Padrões e Desenvolvimento de WebRTC

<p align="left">
Habilitar a comunicação em tempo real no navegador é uma tarefa ambiciosa e, sem dúvida, uma das adições mais significativas à plataforma web desde o seu início. O WebRTC rompe com o modelo familiar de comunicação cliente-servidor, que resulta em uma reengenharia completa da camada de rede no navegador, e também traz uma pilha de mídia totalmente nova, necessária para permitir um processamento eficiente e em tempo real de áudio e vídeo.

WebRTC não é um padrão em branco. Embora seu objetivo principal seja permitir a comunicação em tempo real entre navegadores, ele também foi projetado para ser integrado aos sistemas de comunicação existentes: voz sobre IP (VOIP), vários clientes SIP e até a rede telefônica pública comutada (PSTN) , apenas para citar alguns. Os padrões WebRTC não definem nenhum requisito específico de interoperabilidade ou APIs, mas tentam reutilizar os mesmos conceitos e protocolos sempre que possível.
</p>

## Engine de áudio e vídeo

<p align="left">
Habilitar uma experiência rica de teleconferência no navegador requer que o navegador seja capaz de acessar o hardware do sistema para capturar áudio e vídeo – sem plug-ins de terceiros ou drivers personalizados, apenas uma API simples e consistente. No entanto, os fluxos de áudio e vídeo brutos também não são suficientes por si só: cada fluxo deve ser processado para melhorar a qualidade, sincronizado e a taxa de bits de saída deve se ajustar à largura de banda e à latência continuamente flutuantes entre os clientes.

Na extremidade receptora, o processo é revertido e o cliente deve decodificar os fluxos em tempo real e ser capaz de se ajustar ao jitter da rede e aos atrasos de latência. Em suma, capturar e processar áudio e vídeo é um problema complexo. No entanto, a boa notícia é que o WebRTC traz mecanismos de áudio e vídeo completos para o navegador, que cuidam de todo o processamento do sinal e muito mais em nosso nome.

O fluxo de áudio adquirido é processado para redução de ruído e cancelamento de eco e, em seguida, codificado automaticamente com um dos codecs de áudio otimizados de banda estreita ou banda larga. Por fim, um algoritmo especial de ocultação de erros é usado para ocultar os efeitos negativos do jitter da rede e da perda de pacotes - esses são apenas os destaques! O mecanismo de vídeo executa processamento semelhante otimizando a qualidade da imagem, escolhendo as configurações ideais de compactação e codec, aplicando jitter e ocultação de perda de pacote e muito mais.

Todo o processamento é feito diretamente pelo navegador e, ainda mais importante, o navegador ajusta dinamicamente seu pipeline de processamento para levar em conta os parâmetros em constante mudança dos fluxos de áudio e vídeo e as condições de rede. Depois que todo esse trabalho é feito, o aplicativo da Web recebe o fluxo de mídia otimizado, que pode ser enviado para a tela e os alto-falantes locais, encaminhar para seus pares ou pós-processar usando uma das APIs de mídia HTML5!
</p>

## Real-Time Network Transports

<p align="left">
A comunicação em tempo real é sensível ao tempo; isso não deveria ser nenhuma surpresa. Como resultado, os aplicativos de streaming de áudio e vídeo são projetados para tolerar a perda intermitente de pacotes: os codecs de áudio e vídeo podem preencher pequenas lacunas de dados, geralmente com impacto mínimo na qualidade de saída. Da mesma forma, os aplicativos devem implementar sua própria lógica para se recuperar de pacotes perdidos ou atrasados ​​que transportam outros tipos de dados de aplicativos. A pontualidade e a baixa latência podem ser mais importantes do que a confiabilidade.

A exigência de pontualidade em vez de confiabilidade é a principal razão pela qual o protocolo UDP é o transporte preferido para entrega de dados em tempo real. O TCP entrega um fluxo de dados confiável e ordenado: se um pacote intermediário for perdido, o TCP armazena em buffer todos os pacotes depois dele, aguarda uma retransmissão e, em seguida, entrega o fluxo para o aplicativo.

O UDP não oferece promessas de confiabilidade ou ordem dos dados e entrega cada pacote ao aplicativo no momento em que chega. Na verdade, é um invólucro fino em torno do modelo de entrega de melhor esforço oferecido pela camada IP de nossas pilhas de rede.

O WebRTC usa UDP na camada de transporte: a latência e a pontualidade são críticas. Com isso, podemos simplesmente disparar nossos pacotes UDP de áudio, vídeo e aplicativo, e estamos prontos, certo? Bem, não exatamente. Também precisamos de mecanismos para percorrer as várias camadas de NATs e firewalls, negociar os parâmetros para cada fluxo, fornecer criptografia de dados do usuário, implementar controle de congestionamento e fluxo e muito mais!
</p>

## Estabelecendo uma conexão ponto a ponto

<p align="left">
Iniciar uma conexão ponto a ponto requer (muito) mais trabalho do que abrir um XHR, EventSource ou uma nova sessão WebSocket: os três últimos dependem de um mecanismo de handshake HTTP bem definido para negociar os parâmetros da conexão, e todos os três assume implicitamente que o servidor de destino pode ser alcançado pelo cliente, ou seja, o servidor tem um endereço IP publicamente roteável ou o cliente e o servidor estão localizados na mesma rede interna.

Por outro lado, é provável que os dois peers WebRTC estejam dentro de suas próprias redes privadas distintas e atrás de uma ou mais camadas de NATs. Como resultado, nenhum dos pares é diretamente alcançável pelo outro. Para iniciar uma sessão, devemos primeiro reunir os possíveis candidatos de IP e porta para cada peer, percorrer os NATs e, em seguida, executar as verificações de conectividade para encontrar aqueles que funcionam e, mesmo assim, não há garantias de que teremos sucesso.

No entanto, embora a travessia de NAT seja um problema com o qual devemos lidar, talvez já tenhamos nos adiantado. Quando abrimos uma conexão HTTP com um servidor, há uma suposição implícita de que o servidor está escutando nosso handshake; ele pode querer recusá-lo, mas mesmo assim está sempre atento a novas conexões. Infelizmente, o mesmo não pode ser dito sobre um peer remoto: o peer pode estar offline ou inacessível, ocupado ou simplesmente não interessado em iniciar uma conexão com a outra parte.

As a result, in order to establish a successful peer-to-peer connection, we must first solve several additional problems:

- Devemos notificar o outro peer da intenção de abrir uma conexão peer-to-peer, de modo que ele saiba começar a ouvir os pacotes recebidos.
- Devemos identificar possíveis caminhos de roteamento para a conexão ponto a ponto em ambos os lados da conexão e retransmitir essas informações entre os pares.
- Devemos trocar as informações necessárias sobre os parâmetros das diferentes mídias e fluxos de dados – protocolos, codificações usadas e assim por diante.

A boa notícia é que o WebRTC resolve um dos problemas em nosso nome: o protocolo ICE integrado realiza as verificações necessárias de roteamento e conectividade. No entanto, a entrega das notificações (sinalização) e a negociação da sessão inicial ficam a cargo da aplicação.
</p>

## Entregando dados de mídia e aplicativos

<p align="left">
Estabelecer uma conexão ponto a ponto exige um pouco de trabalho. No entanto, mesmo quando os clientes concluem o fluxo de trabalho de oferta de resposta e cada cliente executa suas travessias NAT e verificações de conectividade STUN, ainda estamos apenas na metade da nossa pilha de protocolos WebRTC. Neste ponto, ambos os pares têm conexões UDP brutas abertas entre si, o que fornece um transporte de datagrama sem frescuras, mas como sabemos, isso não é suficiente por si só.

Sem controle de fluxo, controle de congestionamento, verificação de erros e algum mecanismo para estimativa de largura de banda e latência, podemos facilmente sobrecarregar a rede, o que levaria a um desempenho degradado tanto para os pares quanto para aqueles ao seu redor. Além disso, o UDP transfere dados de forma clara, enquanto o WebRTC exige que criptografemos todas as comunicações! Para resolver isso, o WebRTC coloca vários protocolos adicionais em cima do UDP para preencher as lacunas:

- Datagram Transport Layer Security (DTLS) é usado para negociar as chaves secretas para criptografar dados de mídia e para transporte seguro de dados de aplicativos.
- O Secure Real-Time Transport (SRTP) é usado para transportar fluxos de áudio e vídeo.
- O Stream Control Transport Protocol (SCTP) é usado para transportar dados de aplicativos.
</p>

## DataChannel

<p align="left">
O DataChannel permite a troca bidirecional de dados de aplicativos arbitrários entre pares — pense em WebSocket, mas ponto a ponto, e com propriedades de entrega personalizáveis ​​do transporte subjacente. Uma vez que o RTCPeerConnection é estabelecido, os peers conectados podem abrir um ou mais canais para trocar texto ou dados binários.

O DataChannel é peer-to-peer e é executado em um protocolo de transporte mais flexível, além de oferecer vários recursos adicionais não disponíveis para o WebSocket. O exemplo de código anterior destaca algumas das diferenças mais importantes:
- Ao contrário do construtor WebSocket, que espera a URL do servidor WebSocket, DataChannel é um método de fábrica no objeto RTCPeerConnection.
- Ao contrário do WebSocket, qualquer um dos pares pode iniciar uma nova sessão do DataChannel: o retorno de chamada do ondatachannel é acionado quando uma nova sessão do DataChannel é estabelecida.
- Ao contrário do WebSocket, que é executado em cima do transporte TCP confiável e em ordem, cada DataChannel pode ser configurado com entrega personalizada e semântica de confiabilidade.
</p>

## Casos de uso e desempenho do WebRTC

<p align="left">
A implementação de um transporte ponto a ponto de baixa latência é um desafio de engenharia não trivial: há travessias de NAT e verificações de conectividade, sinalização, segurança, controle de congestionamento e uma infinidade de outros detalhes para cuidar. O WebRTC lida com todos os itens acima e muito mais, em nosso nome, e é por isso que é sem dúvida uma das adições mais significativas à plataforma da web desde o seu início. Na verdade, não são apenas as peças individuais oferecidas pelo WebRTC, mas o fato de que todos os componentes trabalham juntos para fornecer uma API simples e unificada para criar aplicativos ponto a ponto no navegador.

No entanto, mesmo com todos os serviços integrados, projetar aplicativos peer-to-peer eficientes e de alto desempenho ainda requer uma grande quantidade de pensamento e planejamento cuidadosos: peer-to-peer não significa alto desempenho por si só. De qualquer forma, a maior variabilidade na largura de banda e latência entre os pares e as altas demandas de transferências de mídia, bem como as peculiaridades de entrega não confiável, tornam o desafio de engenharia ainda mais difícil.
</p>

## Lista de verificação de desempenho

<p align="left">
As arquiteturas ponto a ponto apresentam seu próprio conjunto exclusivo de desafios de desempenho para o aplicativo. A comunicação direta, um para um, é relativamente direta, mas as coisas ficam muito mais complexas quando mais de duas partes estão envolvidas, pelo menos no que diz respeito ao desempenho. Uma pequena lista de critérios para colocar na agenda:

- Serviço de sinalização
    - Use um transporte de baixa latência.
    - Forneça capacidade suficiente.
    - Considere o uso de sinalização sobre DataChannel assim que a conexão for estabelecida.

- Travessia de firewall e NAT
    - Forneça um servidor STUN ao iniciar o RTCPeerConnection.
    - Use trickle ICE sempre que possível - mais sinalização, mas configuração mais rápida.
    - Forneça um servidor TURN para retransmitir conexões ponto a ponto com falha.
    - Antecipar e fornecer capacidade suficiente para relés TURN.

- Distribuição de dados
    - Considere usar um supernó ou um intermediário dedicado para comunicação multipartidária grande.
    - Considere otimizar os dados recebidos no intermediário antes de encaminhá-los para os outros peers.

- Eficiência de dados
    - Especifique as restrições de mídia apropriadas para fluxos de voz e vídeo.
    - Otimize as cargas binárias enviadas pelo DataChannel.
    - Considere compactar o conteúdo UTF-8 enviado pelo DataChannel.
    - Monitore a quantidade de dados armazenados em buffer no DataChannel e adapte-se às mudanças nas condições do link de rede.

- Entrega e confiabilidade
    - Use a entrega fora de ordem para evitar o bloqueio do início da linha.
    - Se a entrega em ordem for usada, minimize o tamanho da mensagem para reduzir o impacto do bloqueio de cabeçalho.
    - Envie mensagens pequenas (< 1.150 bytes) para minimizar o impacto da perda de pacotes em mensagens fragmentadas do aplicativo.
    - Defina a contagem e os tempos limite de retransmissão apropriados para uma entrega parcialmente confiável. As configurações "certas" dependem do tamanho da mensagem, do tipo de dados do aplicativo e da latência entre os pares.
</p>