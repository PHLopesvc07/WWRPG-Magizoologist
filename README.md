# WWRPG - Catalog (Registo de Animais Mágicos e Feitiços)

O **Registo de Animais Mágicos e Feitiços** é um catálogo digital imersivo desenvolvido para auxiliar nas sessões de RPG de mesa baseadas no universo de Harry Potter (Wizarding World). Ele roda diretamente no navegador e serve tanto como um criador de fichas quanto como um motor de busca para inserir novas criaturas e encantamentos na sua campanha.

Com uma interface inspirada na burocracia do Ministério da Magia (Departamento para Regulamentação e Controle das Criaturas Mágicas e Departamento de Execução das Leis da Magia), a ferramenta permite padronizar a criação de monstros, feras, seres mágicos e agora, o arsenal mágico dos bruxos.

---

## Funcionalidades

### I. Aba de Registo de Criaturas (Criação)
* **Formulário Completo:** Campos para dados de identificação (tamanho, peso, origem, tipo de locomoção, interação).
* **Classificação Oficial:** Sistema de classificação do Ministério da Magia (X a XXXXX) e exigência de licença.
* **Sistema de Atributos Dinâmico:** Os atributos base (Corpo, Destreza, Vitalidade) são fixos, mas atributos mentais e sociais (Instinto, Carisma, Inteligência, Sabedoria) aparecem dinamicamente dependendo do "Tipo da Criatura" (Bestial, Neutro, Consciente).
* **Processamento Visual:** Upload de imagem da criatura com conversão automática para `Base64` direto no navegador (não requer servidor de imagens).
* **Exportação Mágica:** Gera e faz o download de um ficheiro `.json` perfeitamente formatado com todos os dados da criatura.

### II. Aba de Arquivo de Criaturas (Consulta)
* **Leitura Automatizada:** Busca e lista todos os ficheiros `.json` de criaturas registadas no sistema.
* **Filtros Avançados:** Filtre o índice por Tipo, Classificação M.M., Locomoção, Origem e Interação.
* **Ordenação:** Organize o índice em ordem alfabética (A-Z ou Z-A).
* **Dossiê Detalhado:** Ao clicar numa criatura no índice, visualize a foto, atributos como insígnias e a descrição completa num painel lateral.

### III. Aba de Registo de Feitiços (Criação)
* **Formulário Mágico:** Registo padronizado de magias, definindo o Nome, Categoria (Feitiço, Azaração, Maldição, Cura, etc.) e o Nível de Domínio (1 a 7).
* **Geração de Manuscrito:** Exporta o feitiço formulado diretamente para um ficheiro `.json` estruturado.

### IV. Aba de Arquivo de Feitiços (Consulta e Listas)
* **Catálogo de Feitiços:** Consulta automática ao diretório de feitiços com filtros rápidos por Categoria e Nível.
* **Extração Individual:** Botão rápido para descarregar o `.json` de qualquer feitiço existente na base de dados.
* **Criador de Listas Múltiplas:** Uma ferramenta inovadora que permite ativar um "Modo de Lista". Selecione múltiplos feitiços usando caixas de seleção (*checkboxes*) — navegando livremente pelos filtros sem perder a seleção — e exporte um único ficheiro `.json` consolidado com todo o seu arsenal mágico selecionado.

---

## Tecnologias Utilizadas

Este é um projeto *Front-end Vanilla*, leve e sem dependências pesadas, focado na facilidade de hospedagem (como o GitHub Pages):
* **HTML5:** Estrutura semântica e acessível.
* **CSS3:** Estilização responsiva utilizando *CSS Variables* para manter o esquema de cores em tons de pergaminho, tinta e ouro mágico.
* **JavaScript (Vanilla):** Lógica de interface, manipulação de ficheiros (FileReader), requisições assíncronas (Fetch API), manipulação de `Set` para preservação de estados e filtros de arrays.

---

## Como Usar e Adicionar Novos Registos

Como o sistema não possui uma base de dados tradicional (SQL/NoSQL), ele utiliza a estrutura de pastas do projeto para atuar como o arquivo oficial do Ministério. É imperativo o uso de um servidor local (ex: *Live Server* do VS Code) para que o navegador consiga ler os ficheiros devido às políticas de segurança (CORS).

### Para Registar uma Criatura Mágica:
1. Abra o sistema e vá à aba **I. Registrar Criatura**.
2. Preencha todos os dados e adicione uma foto.
3. Clique em **"Carimbar e Salvar Arquivo"**. O navegador fará o download de um ficheiro `.json` (ex: `dragao_rabo_corneo.json`).
4. Mova este ficheiro para dentro da pasta `dados/` no diretório do seu projeto.
5. Abra o ficheiro `dados/indice.json` e adicione o nome exato do novo ficheiro na lista. Exemplo:
   ```json
   [
     "dragao.json",
     "basilisco.json",
     "dragao_rabo_corneo.json"
   ]

### Para Registar um Feitiço:
1. Abra o sistema e vá à aba **I. Registrar Feitiço**.
2. Preencha todos os dados.
3. Clique em **"Carimbar e Salvar Arquivo"**. O navegador fará o download de um ficheiro `.json` (ex: `feitico_expelliarmus.json`).
4. Mova este ficheiro para dentro da pasta `feiticos/` no diretório do seu projeto.
5. Abra o ficheiro `feiticos/indice_feiticos.json` e adicione o nome exato do novo ficheiro na lista. Exemplo:
   ```json
   [
     "feitico_lumos.json",
     "feitico_expelliarmus.json"
   ]
