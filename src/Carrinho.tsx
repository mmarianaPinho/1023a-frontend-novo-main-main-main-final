import React, { useEffect, useState } from "react";
import api from "./api/api";
import { useNavigate } from "react-router-dom";
import "./App.css";

type ItemCarrinho = {
  _id: string;
  produto: {
    _id: string;
    nome: string;
    preco: number;
    urlfoto: string;
  };
  quantidade: number;
};

export default function Carrinho() {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa fazer login para ver o carrinho.");
      navigate("/login");
      return;
    }

    api
      .get("/carrinho")
      .then((res) => setItens(res.data.itens))
      .catch(() => setErro("Não foi possível carregar o carrinho."));
  }, [navigate]);

  // ✅ Atualiza quantidade corretamente (enviando produtoId + quantidade)
  const atualizarQuantidade = async (produtoId: string, novaQtd: number) => {
    try {
      await api.put(`/carrinho/${produtoId}`, { produtoId, quantidade: novaQtd });
      setItens((prev) =>
        prev.map((item) =>
          item.produto._id === produtoId
            ? { ...item, quantidade: novaQtd }
            : item
        )
      );
    } catch {
      alert("Erro ao atualizar quantidade");
    }
  };

  const removerItem = (produtoId: string) => {
    api
      .delete(`/carrinho/${produtoId}`)
      .then(() =>
        setItens(itens.filter((item) => item.produto._id !== produtoId))
      )
      .catch(() => alert("Erro ao remover item"));
  };

  const limparCarrinho = () => {
    api
      .delete("/carrinho")
      .then(() => setItens([]))
      .catch(() => alert("Erro ao limpar carrinho"));
  };

  if (erro) return <p>{erro}</p>;

  // ✅ Calcula total do carrinho
  const total = itens.reduce(
    (acc, item) => acc + item.produto.preco * item.quantidade,
    0
  );

  return (
    <div className="carrinho-container">
      <h1>🛒 Meu Carrinho</h1>
      <button onClick={() => navigate("/")}>Voltar</button>

      {itens.length === 0 ? (
        <p>Seu carrinho está vazio.</p>
      ) : (
        <>
          {itens.map((item) => (
            <div key={item._id} className="item-carrinho">
  <div className="item-info">
    <img src={item.produto.urlfoto} alt={item.produto.nome} />
    <div className="item-detalhes">
      <h3>{item.produto.nome}</h3>
      <p>Preço: R$ {item.produto.preco}</p>
    </div>
  </div>

  <div className="item-acoes">
    <button onClick={() => atualizarQuantidade(item.produto._id, item.quantidade - 1)} disabled={item.quantidade <= 1}>-</button>
    <input
      type="number"
      min={1}
      value={item.quantidade}
      onChange={(e) => atualizarQuantidade(item.produto._id, Number(e.target.value))}
    />
    <button onClick={() => atualizarQuantidade(item.produto._id, item.quantidade + 1)}>+</button>
    <button className="item-remover" onClick={() => removerItem(item.produto._id)}>Remover</button>
  </div>
</div>

          ))}

          <h2>Total: R$ {total.toFixed(2)}</h2>
          <button className="btn-limpar" onClick={limparCarrinho}>🗑 Limpar Carrinho</button>
        </>
      )}
    </div>
  );
}
