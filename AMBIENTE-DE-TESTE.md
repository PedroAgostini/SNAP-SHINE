# Publicação do ambiente de teste

Destino: **https://snapshine.escolats.com.br/**

O pacote `snapshine-teste.zip` contém somente os arquivos públicos, incluindo `.htaccess` e `.well-known/security.txt`. As revisões mobile do blog e as 12 fotos WebP selecionadas estão incluídas. As fotos de ambientes aparecem na home; os quatro pares reais estão no quadro original da seção Results, com miniaturas abaixo e divisão fixa, sem arraste, porque seus enquadramentos diferem. Os arquivos originais de fotos e vídeos, a galeria de curadoria e suas notas ficam fora do ZIP. Não há necessidade de build ou instalação de dependências no servidor.

## Upload

1. Configure o subdomínio na hospedagem e habilite o certificado HTTPS.
2. Extraia o conteúdo do ZIP diretamente na pasta raiz desse subdomínio. `index.html` e `.htaccess` devem ficar lado a lado, sem uma pasta extra envolvendo o site.
3. Confira que os arquivos iniciados por ponto foram enviados. `.well-known` é uma pasta; `security.txt` fica dentro dela.
4. Desative o cache de página/CDN do subdomínio no painel da hospedagem enquanto estiver revisando. O `.htaccess` envia `no-store` para o navegador; um cache imposto pelo painel pode exigir limpeza separada.
5. Abra a home, o blog e `/clear-cache.html` usando HTTPS.

Requisitos da configuração: Apache 2.4 ou LiteSpeed compatível, com `.htaccess` habilitado e suporte a `mod_rewrite` e `mod_headers`. O site principal é estático. O arquivo PHP é apenas uma biblioteca para integração futura; o formulário permanece desativado.

## Arquivos preparados

| Arquivo | Função |
| --- | --- |
| `.htaccess` | HTTPS temporário para o domínio de teste, bloqueio de arquivos internos, compressão, cabeçalhos de cache e `X-Robots-Tag`. |
| `robots.txt` | Permite ler as páginas para que os buscadores reconheçam `noindex`; restringe utilitários. |
| `sitemap.xml` | Lista as duas páginas existentes, com URLs do ambiente de teste. Não inclui artigos sem destino nem utilitários. |
| `llms.txt` / `llms-full.txt` | Contexto da empresa, referências e indicação explícita de ambiente de teste e conteúdo demonstrativo. |
| `humans.txt` | Créditos do site e tecnologias utilizadas. |
| `site.webmanifest` | Identidade do site, cores e ícone quadrado usando o logo existente. Abre no navegador; não declara funcionamento offline. |
| `clear-cache.html` | Solicita a limpeza do cache deste domínio no navegador compatível via `Clear-Site-Data: "cache"`. Não limpa cookies, sessões, dados salvos ou cache do servidor. |
| `antispam.php` | Validador reutilizável: honeypot, tipos, limites e campos do formulário. Acesso HTTP direto é bloqueado; não recebe, armazena nem envia mensagens. |
| `.well-known/security.txt` | Contato já existente da empresa para relatos de segurança; revisar antes de 08/04/2027. |

## Formulário desativado

Conforme solicitado, a navegação entre etapas continua funcionando, mas o botão final está desativado e o aviso de teste fica visível. O JavaScript também impede o envio por Enter ou evento de formulário. Não existe `action` configurada e nenhuma confirmação de envio fictício é exibida.

O honeypot `company_website` já está no HTML. `antispam.php` é uma biblioteca preparada, ainda **não integrada a um endpoint**. Para habilitar envios futuramente, o endpoint deverá incluir essa biblioteca, verificar seus erros, adicionar proteção CSRF e limitação de requisições no servidor e conectar o serviço de entrega. Só então remover `data-submission-disabled`, o atributo `disabled` e o aviso de teste, restaurar o texto do botão e configurar `action` com `method="post"`.

## Indexação e produção

As duas páginas contêm `noindex, nofollow, nosnippet`, também enviado por `.htaccess`. `robots.txt` permite a leitura das páginas porque bloquear o rastreamento impediria o buscador de enxergar `noindex`. Isso controla buscadores cooperantes; o endereço continua acessível para revisão.

O sitemap foi preparado para validar a estrutura, mas **não deve ser enviado ao Search Console neste ambiente**. Na produção: atualizar domínio nas URLs canônicas, sitemap, arquivos llms e security.txt; revisar `noindex`, robots, redirects e política de cache; substituir conteúdo demonstrativo; conectar o formulário. Não publicar este `.htaccess` de teste sem essa revisão.

## Conferência na hospedagem

- Home e blog: HTTP 200, layout e imagens carregados.
- Acesso HTTP ao domínio de teste: redirecionamento 302 para HTTPS.
- Respostas: `X-Robots-Tag: noindex, nofollow, nosnippet` e `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`.
- `/site.webmanifest`: JSON válido com `Content-Type: application/manifest+json`.
- `/.well-known/security.txt`: HTTP 200 e texto legível.
- `/clear-cache.html`: cabeçalho `Clear-Site-Data: "cache"`; o suporte depende do navegador e de HTTPS.
- `/antispam.php`: HTTP 403 com este `.htaccess`. Se a regra Apache não estiver ativa, PHP retorna 503 e a mensagem de envio desativado.
- Formulário: etapas navegáveis, botão final desativado e nenhum POST.

O Apache e o PHP não estão instalados no ambiente local desta revisão. A aplicação efetiva do `.htaccess` e a execução do PHP precisam ser confirmadas na hospedagem; não foi realizado upload.

Para gerar novamente o ZIP após editar os arquivos, execute `./preparar-teste.ps1` na pasta do projeto.

## Referências

- [Google: bloquear indexação com noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Apache: mod_headers](https://httpd.apache.org/docs/2.4/mod/mod_headers.html)
- [MDN: Clear-Site-Data](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Clear-Site-Data)
- [Proposta llms.txt](https://llmstxt.org/)
- [RFC 9116: security.txt](https://www.rfc-editor.org/rfc/rfc9116.html)
