const knex = require("../database/dbConfig");

module.exports = {
  // index: listagem
  // store/create: inclusão
  // update: alteração
  // show: obter 1 registro
  // destroy: exclusão

  async index(req, res) {
    // const carros = await knex("carros")
    //   .join("marcas", "carros.marca_id", "=", "marcas.id")
    //   .orderBy("carros.id", "desc");

    const carros = await knex
      .select("c.id", "c.modelo", "m.nome as marca", "c.ano", "c.preco", "c.foto", "c.destaque")
      .from("carros as c")
      .leftJoin("marcas as m", "c.marca_id", "m.id")
      .orderBy("c.id", "desc");
    res.status(200).json(carros);
  },


  async index2(req, res) {
  
    const carros = await knex
      .select("c.id", "c.modelo","r.comentario","r.usuarios_id","r.estrelas","c.foto","m.nome as marca", "c.ano", "c.preco", "c.foto", "c.destaque")
      .from("carros as c")
      .leftJoin("marcas as m", "c.marca_id", "m.id")
      .leftJoin("reviews as r", "c.id", "r.carros_id").whereNotNull('r.id')
      .orderBy("c.id", "desc");
    res.status(200).json(carros);
  },



  async show(req, res) {
    const id = req.params.id; // ou:  const { id } = req.params

    const carro = await knex
      .select("c.id", "c.modelo", "c.marca_id", "m.nome as marca", "c.ano", "c.preco", "c.foto", "c.destaque")
      .from("carros as c")
      .leftJoin("marcas as m", "c.marca_id", "m.id")
      .where("c.id", id)
    res.status(200).json(carro[0]);
  },

  async search(req, res) {
    const palavra = req.params.palavra; 

    const carros = await knex
      .select("c.id", "c.modelo", "m.nome as marca", "c.ano", "c.preco", "c.foto", "c.destaque")
      .from("carros as c")
      .leftJoin("marcas as m", "c.marca_id", "m.id")
      .where("modelo", "like", "%"+palavra+"%")
      .orWhere("m.nome", "like", "%"+palavra+"%")
      .orderBy("c.id", "desc");
    res.status(200).json(carros);
  },

  async store(req, res) {
    console.log(req.body)

    // desestruturação do objeto request
    const { modelo, marca_id, ano, preco, foto } = req.body;

    if (!modelo) {
      res.status(400).json({
        erro: "faltou modelo",
      });
      return;
    }

    // se algum dos atributos não for passado
    if (!modelo || !marca_id || !ano || !preco || !foto) {
      res.status(400).json({
        erro: "Enviar modelo, marca_id, ano, preco e foto do veículo",
      });
      return;
    }

    try {
      const novo = await knex("carros").insert({
        modelo,
        marca_id,
        ano,
        preco,
        foto,
      });
      res.status(201).json({ id: novo[0] });
    } catch (error) {
      res.status(400).json({ erro: error.message });
    }
  },
  
  async destaque(req, res) {
    const id = req.params.id; // ou:  const { id } = req.params
    dados = await knex("carros").where({ id });
//    console.log(dados[0]);

    if (dados[0].destaque) {
      try {
        await knex("carros").update({ destaque: 0 }).where({ id });
        res.status(200).json({ ok: 1 });
      } catch (error) {
        res
          .status(400)
          .json({ ok: 0, msg: `Erro na alteração: ${error.message}` });
      }
    } else {
      try {
        await knex("carros").update({ destaque: 1 }).where({ id });
        res.status(200).json({ ok: 1 });
      } catch (error) {
        res
          .status(400)
          .json({ ok: 0, msg: `Erro na alteração: ${error.message}` });
      }
    }
  },
  
  async destaques(req, res) {
    const carros = await knex
      .select("c.id", "c.modelo", "m.nome as marca", "c.ano", "c.preco", "c.foto", "c.destaque")
      .from("carros as c")
      .leftJoin("marcas as m", "c.marca_id", "m.id")
      .where("c.destaque", true)
      .orderBy("c.id", "desc");
    res.status(200).json(carros);
  },
  
  async like(req,res){
    const id = req.params.id;
    dados = await knex("carros").where({id})
    const numLike = dados[0].likes
    try {
      await knex("carros").update({likes: numLike+1}).where({id});
      res.status(200).json({ok:1})
    } catch (error) {
      res.status(400)
      .json({ok:0,msg:`erro na alteração${error.message}`})
    }
  },
  async destroy(req, res) {
    const id = req.params.id; // ou:  const { id } = req.params
    try {
      await knex("carros").del().where({ id });
      res.status(200).json({ ok: 1 });
    } catch (error) {
      res.status(400).json({ ok: 0, msg: `Erro na exclusão: ${error.message}` });
    }
  },
    
};
