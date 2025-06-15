const Transacao = require('../models/Transacao');
const ProfessorDAO = require('../dao/ProfessorDAO');
const TransacaoDAO = require('../dao/TransacaoDAO');
const AlunoDAO = require('../dao/AlunoDAO');
const { enviarEmail } = require('../services/EmailService');

const enviarMoedas = async (req, res) => {
  try {
    const { professor_id, aluno_id, quantidade, mensagem } = req.body;
    console.log("📦 Dados recebidos:", req.body);

    if (!mensagem || mensagem.trim() === '') {
      return res.status(400).send('Motivo é obrigatório');
    }

    const professor = await ProfessorDAO.findById(professor_id);
    console.log("🔎 Resultado de findById:", professor);

    if (!professor) {
      return res.status(404).send('Professor não encontrado');
    }

    if (professor.saldo < quantidade) {
      return res.status(400).send('Saldo insuficiente');
    }

    const aluno = await AlunoDAO.readById(aluno_id);

    const novaTransacao = new Transacao(professor_id, aluno_id, quantidade, mensagem);
    await TransacaoDAO.registrar(novaTransacao);
    await ProfessorDAO.updateSaldo(professor_id, professor.saldo - quantidade);
    await AlunoDAO.adicionarMoedas(aluno_id, quantidade);

    
    const mensagemEmail = `
Olá ${aluno.nome},

Você recebeu ${quantidade} moedas do(a) professor(a) ${professor.nome}!

Motivo: ${mensagem}

Consulte seu novo saldo na plataforma.

Atenciosamente,

Sistema de Moeda Estudantil
    `;

    await enviarEmail(aluno.email, 'Você recebeu moedas!', mensagemEmail);

    res.status(201).send('Moedas enviadas com sucesso');
  } catch (err) {
    console.error("❌ Erro ao enviar moedas:", err);
    res.status(500).send(err.message);
  }
};

const extratoProfessor = async (req, res) => {
  try {
    const id = req.params.id;
    const extrato = await TransacaoDAO.extratoProfessor(id);
    res.json(extrato);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const extratoAluno = async (req, res) => {
  try {
    const id = req.params.id;
    const extrato = await TransacaoDAO.extratoAluno(id);
    res.json(extrato);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = { enviarMoedas, extratoProfessor, extratoAluno };