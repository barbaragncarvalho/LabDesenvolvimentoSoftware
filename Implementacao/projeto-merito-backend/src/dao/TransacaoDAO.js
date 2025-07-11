const db = require('./Database');
const Transacao = require('../models/Transacao');

class TransacaoDAO {
  async registrar(transacao) {
    const sql = 'INSERT INTO transacoes (professor_id, aluno_id, quantidade, mensagem, data) VALUES (?, ?, ?, ?, ?)';
    await db.query(sql, [
      transacao.professor_id,
      transacao.aluno_id,
      transacao.quantidade,
      transacao.mensagem,
      transacao.data
    ]);
  }

  async extratoProfessor(id) {
    const sql = `
    SELECT t.id, t.quantidade, t.mensagem, t.data,
           a.nome AS nome_aluno,
           p.nome AS nome_professor
    FROM transacoes t
    JOIN alunos a ON t.aluno_id = a.id
    JOIN professores p ON t.professor_id = p.id
    WHERE t.professor_id = ?
    ORDER BY t.data DESC
  `;
    return await db.query(sql, [id]);
  }

  async extratoAluno(id) {
  const sql = `
    SELECT 
      t.id, 
      t.quantidade, 
      t.mensagem, 
      t.data,
      a.nome AS nome_aluno,
      p.nome AS nome_professor,
      'recebido' AS tipo
    FROM transacoes t
    JOIN alunos a ON t.aluno_id = a.id
    JOIN professores p ON t.professor_id = p.id
    WHERE t.aluno_id = ?

    UNION ALL

    SELECT 
      c.id, 
      v.custo_moedas AS quantidade, 
      'Compra de vantagem' AS mensagem, 
      c.data,
      a.nome AS nome_aluno,
      NULL AS nome_professor,
      'gasto' AS tipo
    FROM compras c
    JOIN vantagens v ON c.vantagem_id = v.id
    JOIN alunos a ON c.aluno_id = a.id
    WHERE c.aluno_id = ?

    ORDER BY data DESC
  `;
  return await db.query(sql, [id, id]);
}
}

module.exports = new TransacaoDAO();