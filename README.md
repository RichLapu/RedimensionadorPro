🖼️ Redimensionador Pro

Uma ferramenta de nível empresarial para processamento em lote de imagens diretamente no navegador. Construída com foco na privacidade, performance e experiência de utilização (UX).

🔗 Ver Demonstração ao Vivo

Coloque aqui um GIF de demonstração de 10-15 segundos mostrando o drag & drop, o recorte e a marca d'água.

✨ Principais Funcionalidades

Processamento 100% Client-Side: As imagens nunca saem do dispositivo do utilizador. Toda a manipulação é feita usando a API Canvas do HTML5, garantindo total privacidade e velocidade instantânea.

Compressão Inteligente (Pesquisa Binária): Em vez de adivinhar percentagens, o utilizador define um limite máximo em KB. O motor executa uma pesquisa binária nos bastidores para exportar a imagem na qualidade mais alta possível que respeite o peso estipulado.

Manipulação Individual em Lote: Reordenação de imagens por arrasto (Drag & Drop) e interface de recorte livre (Crop) individual antes do processamento final.

Marca d'Água Dinâmica: Aplicação em lote de texto customizável com cálculos matemáticos automáticos para manter a escala, sombra e posicionamento independentemente da resolução da imagem original.

Comparador Visual: Uma interface elegante de alternância (Original vs Final) para análise rigorosa de perda de nitidez antes do download.

Exportação Flexível: Download individual, geração de arquivo .zip com múltiplas imagens ou compilação de um documento .pdf em tempo real.

🧠 Decisões de Engenharia

Para elevar o projeto além de um simples redimensionador, foram tomadas decisões arquiteturais chave:

Arquitetura de Estado baseada em UUIDs: Em vez de depender do índice de File[], o estado global foi refatorado para suportar ImageItems com identificadores únicos. Isto resolve falhas de renderização durante operações de reordenação (dnd-kit) e assegura que os metadados de recorte pertencem à imagem correta.

Web Workers Simulado com Promises: O processamento em lote utiliza Promise.all acoplado a setTimeout para libertar a main thread da interface, mantendo a aplicação responsiva (sem congelar ecrãs) enquanto o Canvas processa pesadas manipulações de pixeis.

Sistema de Temas (Dark/Light Mode): Integração completa com Tailwind CSS suportada por classes estendidas, garantindo uma UX agradável em qualquer ambiente luminoso.

🚀 Como Executar Localmente

Clone este repositório:

git clone https://github.com/RichLapu/RedimensionadorPro.git


Instale as dependências:

npm install


Inicie o servidor de desenvolvimento:

npm run dev


Aceda a http://localhost:3000 no seu navegador.

Pode testar a ferramenta a funcionar aqui: [https://redimensionador-pro.vercel.app/](https://redimensionador-pro.vercel.app/)

👨‍💻 Autor

Richard Lapuente

LinkedIn: linkedin.com/in/richard-lapuente

GitHub: @RichLapu