<div align="center">
  <img src="assets/img/logo.png" alt="Snap Shine Clean" width="150">

  <h1>Snap Shine Clean</h1>
  <p><strong>Fast, detailed cleaning. More time for what matters.</strong></p>
  <p>Site institucional de limpeza residencial e comercial em Bradenton, Flórida.</p>

  <p>
    <a href="https://snapshineclean.com/">snapshineclean.com</a> ·
    <a href="https://snapshineclean.com/#results">Antes e depois</a> ·
    <a href="#publicar-em-produção">Publicação</a>
  </p>
  <p><strong>HTML · CSS · JavaScript · GSAP · WebP</strong><br>Sem framework. Sem etapa de build.</p>
</div>

---

## O projeto

Uma experiência voltada a apresentar os serviços, mostrar resultados reais e facilitar o contato por telefone, SMS ou solicitação de orçamento. O conteúdo do site está em inglês americano; esta documentação está em português.

![Cozinha presente na abertura do site](assets/imagens-selecionadas/ambientes/01-cozinha-branca-com-ilha.webp)

| Experiência | Implementação |
| --- | --- |
| Página inicial | Apresentação, serviços, portfólio, depoimentos, diferenciais e contato. |
| Portfólio real | Quatro pares de antes e depois, quadro proporcional e miniaturas sem cortes. |
| Navegação mobile | Menu compacto, carrossel de fotos e barra de contato fixa. |
| Blog | 10 artigos (8 do site antigo e 2 novos), em páginas estáticas com sumário, SEO completo (meta tags, Open Graph, JSON-LD) e artigos relacionados. |
| Páginas legais e 404 | `/privacy-policy` e `/terms-of-use` com sumário lateral; `404.html` personalizada para qualquer endereço inexistente. |
| Movimento | GSAP/ScrollTrigger e respeito à preferência por movimento reduzido. |
| Cartão de visitas | `/redirect`: ligar, SMS, orçamento, site, e-mail, Facebook e botão para salvar o contato (`snap-shine-clean.vcf`). Ideal para QR code e bio. |
| Formulário de orçamento | Envio pelo Web3Forms (principal) e cópia opcional do lead para um webhook (`form01`), com honeypot contra bots. |
| Produção | Domínio canônico `https://snapshineclean.com` (sem www), indexação liberada, cache por tipo de arquivo e 404 personalizada. |

## Executar localmente

Clone o repositório:

```sh
git clone https://github.com/PedroAgostini/SNAP-SHINE.git
cd SNAP-SHINE
```

Com Node.js instalado, inicie a prévia local (sem instalar dependências):

```sh
node servir-local.cjs
```

Acesse **http://127.0.0.1:4173/**, **http://127.0.0.1:4173/blog** ou um artigo, como **http://127.0.0.1:4173/blog/house-cleaning-with-dogs-bradenton-fl**. O servidor local reproduz as URLs sem extensão e os redirecionamentos das páginas antigas. Fontes do Google, GSAP, imagens de banco ainda presentes e o mapa dependem de conexão com a internet.

Na hospedagem Apache/LiteSpeed, o `.htaccess` atende `/blog`, `/privacy-policy`, `/terms-of-use` e `/clear-cache` usando os arquivos HTML internamente, e responde endereços inexistentes com `404.html` (status 404). `/index.html` redireciona para `/`, e `/blog.html` redireciona para `/blog`, preservando parâmetros da URL. Cada artigo fica em `artigos/<slug>.html` e é servido em `/blog/<slug>`; os endereços antigos do WordPress (`/<slug>/`) redirecionam com 301 para o novo endereço. Servidores estáticos genéricos que ignoram `.htaccess` precisam de configuração equivalente.

## Estrutura

```text
SNAP-SHINE/
├── index.html                    # Página inicial
├── blog.html                     # Listagem do blog (cards estáticos)
├── artigos/                      # Um HTML por artigo, servido em /blog/<slug>
├── assets/
│   ├── css/                      # Estilos do site e utilitário de cache
│   ├── js/                       # Interações, formulário e blog
│   ├── icons/                    # Os três SVGs externos usados no site
│   ├── img/                      # Logos e ícone do manifesto
│   ├── imagens-blog/             # Imagem de capa de cada artigo (WebP)
│   └── imagens-selecionadas/
│       ├── ambientes/            # Quatro fotos reais em WebP
│       └── antes-e-depois/        # Oito fotos: quatro comparações
├── .well-known/security.txt
├── .htaccess
├── robots.txt / sitemap.xml
├── llms.txt / llms-full.txt
├── humans.txt / site.webmanifest
├── clear-cache.html
├── antispam.php                   # Biblioteca para integração futura
├── preparar-teste.ps1             # Geração do pacote de publicação
├── servir-local.cjs               # Prévia local com URLs sem extensão
└── AMBIENTE-DE-TESTE.md            # Configuração e conferência no servidor
```

## Fotos e antes/depois

**Somente as 12 fotos utilizadas pelo site estão versionadas.** Os originais JPG/HEIC, vídeos, fotos substituídas, galeria interna de curadoria, capturas de revisão e ZIPs permanecem locais, fora do Git. O `.gitignore` usa uma lista explícita de arquivos permitidos.

| Antes | Depois |
| :---: | :---: |
| ![Quarto antes](assets/imagens-selecionadas/antes-e-depois/04-quarto-rosa-antes.webp) | ![Quarto depois](assets/imagens-selecionadas/antes-e-depois/04-quarto-rosa-depois.webp) |

Os pares atuais têm diferenças de posição da câmera e usam **divisão fixa, sem arraste**, preservando o divisor original em formato de rodo. As fotos são exibidas sem filtros que alterem o resultado da limpeza.

Para trocar um par, edite a miniatura correspondente em `index.html`:

| Atributo | Finalidade |
| --- | --- |
| `data-before` / `data-after` | Caminhos das fotos reais em WebP. |
| `data-width` / `data-height` | Dimensões das imagens, usadas para calcular a proporção. |
| `data-room` | Nome do ambiente usado nos textos alternativos. |
| `data-comparison="fixed"` | Mantém a comparação parada. Use `draggable` somente para um par alinhado. |

Atualize também o `src` da miniatura, suas dimensões e a lista de arquivos permitidos no `.gitignore`. Antes de publicar, confira se todas as fotos novas estão no commit.

## Publicar em produção

Envie para a raiz (`public_html`) de **snapshineclean.com**, preservando `.htaccess` e `.well-known/`:

- `index.html`, `blog.html`, `privacy-policy.html`, `terms-of-use.html`, `404.html`, `redirect.html`, `snap-shine-clean.vcf`, `clear-cache.html`
- `artigos/`
- `assets/css/`, `assets/js/`, `assets/icons/`, `assets/img/`, `assets/imagens-blog/`, `assets/imagens-selecionadas/ambientes/` e `assets/imagens-selecionadas/antes-e-depois/`
- `.htaccess`, `.well-known/`, `robots.txt`, `sitemap.xml` (índice), `sitemap-pages.xml`, `sitemap-blog.xml`, `llms.txt`, `llms-full.txt`, `humans.txt`, `site.webmanifest`

Não envie `assets/imagens/` (originais), arquivos `.md`, `servir-local.cjs` nem a pasta `.impeccable/`. A hospedagem deve ter HTTPS ativo e Apache 2.4 ou LiteSpeed compatível.

Ao alterar CSS ou JS, atualize o parâmetro `?v=` nas páginas: esses arquivos ficam 30 dias em cache no navegador.

## Estado desta versão

- O formulário envia pelo Web3Forms e, após o sucesso, pode copiar o lead para um webhook (`data-lead-webhook`). Uma falha no webhook não afeta o visitante.
- **Este repositório público não contém credenciais:** preencha `access_key` e `data-lead-webhook` em `index.html` antes de publicar. A versão de produção fica em um repositório privado.
- `antispam.php` é uma biblioteca auxiliar, não um endpoint ativo; o `.htaccess` bloqueia o acesso direto.
- O blog traz 10 artigos: 8 do site antigo e 2 novos; os endereços do WordPress (`/<slug>/`) redirecionam com 301 para `/blog/<slug>`. O artigo de post-construction foi removido junto com o serviço e redireciona com 301 para `/blog`.
- Algumas imagens ilustrativas de banco continuam em serviços e no CTA do blog. As fotos do portfólio são reais.

## Créditos

**Snap Shine Clean** · Desenvolvimento por [Eu Sou TS](https://eusouts.com.br/).

Fotografias reais fornecidas pelo cliente; imagens ilustrativas remanescentes via Unsplash. Este repositório não concede licença de reutilização da marca ou das fotografias.
