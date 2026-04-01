# 🐉 WWRPG - Magizoologist (Registro de Animais Mágicos)

O **Registro de Animais Mágicos** é um catálogo digital imersivo desenvolvido para auxiliar nas sessões de RPG de mesa baseadas no universo de Harry Potter (Wizarding World). Ele roda diretamente no navegador e serve tanto como um criador de fichas quanto como um buscador para inserir novas criaturas na sua campanha.

Com uma interface inspirada na burocracia do Ministério da Magia (Departamento para Regulamentação e Controle das Criaturas Mágicas), a ferramenta permite padronizar a criação de monstros, feras e seres mágicos.

---

## ✨ Funcionalidades

### I. Aba de Registro (Criação)
* **Formulário Completo:** Campos para dados de identificação (tamanho, peso, origem, tipo de locomoção, interação).
* **Classificação Oficial:** Sistema de classificação do Ministério da Magia (X a XXXXX) e exigência de licença.
* **Sistema de Atributos Dinâmico:** Os atributos base (Corpo, Destreza, Vitalidade) são fixos, mas atributos mentais e sociais (Instinto, Carisma, Inteligência, Sabedoria) aparecem dinamicamente dependendo do "Tipo da Criatura" (Bestial, Neutro, Consciente).
* **Processamento Visual:** Upload de imagem da criatura com conversão automática para `Base64` direto no navegador (não requer servidor de imagens).
* **Exportação Mágica:** Gera e faz o download de um arquivo `.json` perfeitamente formatado com todos os dados da criatura.

### II. Aba de Arquivo (Consulta)
* **Leitura Automatizada:** Busca e lista todos os arquivos `.json` registrados no sistema.
* **Filtros Avançados:** Filtre o índice por Tipo, Classificação M.M., Locomoção, Origem e Interação.
* **Ordenação:** Organize o índice em ordem alfabética (A-Z ou Z-A).
* **Dossiê Detalhado:** Ao clicar em uma criatura no índice, visualize a foto, atributos como insígnias e a descrição completa em um painel lateral.
* **Extração de Cópia:** Botão rápido para baixar o `.json` de uma criatura já existente no banco de dados.

---

## 🛠️ Tecnologias Utilizadas

Este é um projeto *Front-end Vanilla*, leve e sem dependências pesadas, focado na facilidade de hospedagem (como o GitHub Pages):
* **HTML5:** Estrutura semântica e acessível.
* **CSS3:** Estilização responsiva utilizando *CSS Variables* para manter o esquema de cores em tons de pergaminho, tinta e ouro mágico.
* **JavaScript (Vanilla):** Lógica de interface, manipulação de arquivos (FileReader), requisições assíncronas (Fetch API) e filtros de arrays.

---

## 📖 Como Usar e Adicionar Novas Criaturas

Como o sistema não possui um banco de dados tradicional (SQL/NoSQL), ele utiliza a pasta `/dados` para atuar como o arquivo oficial do Ministério.

### Passo a passo para registrar uma criatura:
1. Abra o sistema e vá na aba **I. Registrar Criatura**.
2. Preencha todos os dados e adicione uma foto.
3. Clique em **"Carimbar e Salvar Arquivo"**. O navegador fará o download de um arquivo `.json` (ex: `dragao_rabo_corneo.json`).
4. Mova este arquivo baixado para dentro da pasta `dados/` no diretório do seu projeto.
5. Abra o arquivo `dados/indice.json` e adicione o nome exato do novo arquivo na lista. Exemplo:
   ```json
   [
     "dragao.json",
     "basilisco.json",
     "dragao_rabo_corneo.json"
   ]
