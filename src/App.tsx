import React, { useEffect, useState } from "react";
import api from "./api/api";
import { useNavigate } from "react-router-dom";
import "./App.css";

type ProdutoType = {
  _id: string;
  nome: string;
  preco: number;
  descricao: string;
  urlfoto: string;
};

function App() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<ProdutoType[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  // 🔹 Atualiza o token quando o usuário faz login/logout
  useEffect(() => {
    const atualizarToken = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", atualizarToken);
    return () => window.removeEventListener("storage", atualizarToken);
  }, []);

  // 🔹 Carregar produtos (independente de estar logado)
  useEffect(() => {
    api
      .get("/produtos")
      .then((res) => setProdutos(res.data))
      .catch(() => alert("Erro ao carregar produtos"));
  }, []);

  // 🔹 Adicionar item ao carrinho (só se estiver logado)
  const adicionarItemCarrinho = async (produtoId: string) => {
    if (!token) {
      alert("Você precisa estar logado para adicionar produtos ao carrinho!");
      navigate("/login");
      return;
    }

    try {
      await api.post(
        "/adicionarItem",
        { produtoId, quantidade: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Produto adicionado ao carrinho!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert("Sessão expirada. Faça login novamente.");
        navigate("/login");
      } else {
        alert("Erro ao adicionar ao carrinho.");
      }
    }
  };

  // 🔹 Logout
  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  // 🔹 Cadastrar novo produto
  async function cadastrarProduto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const nome = formData.get("nome");
    const preco = formData.get("preco");
    const descricao = formData.get("descricao");
    const urlfoto = formData.get("urlfoto");

    const novoProduto = { nome, preco, descricao, urlfoto };

    try {
      const response = await api.post("/produtos", novoProduto, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProdutos([...produtos, response.data]);
      alert("Produto cadastrado com sucesso!");
      form.reset();
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      alert("Erro ao cadastrar produto.");
    }
  }

  return (
    <div className="App">
      {/* 🔹 Cabeçalho */}
      <header className="topo">
        {!token ? (
          <button onClick={() => navigate("/login")}>🔐 Fazer Login</button>
        ) : (
          <>
            <button onClick={() => navigate("/carrinho")}>🛒 Ver Carrinho</button>
            <button onClick={handleLogout}>🚪 Sair</button>
          </>
        )}
      </header>

      <h1>🍰 Produtos Disponíveis</h1>

      {/* 🔹 Formulário de cadastro (só aparece se logado) */}
      {token && (
        <div className="cadastro-produto">
          <h2>📦 Cadastrar Novo Produto</h2>
          <form onSubmit={cadastrarProduto}>
            <input type="text" name="nome" placeholder="Nome" required />
            <input type="number" name="preco" placeholder="Preço" required />
            <input type="text" name="descricao" placeholder="Descrição" />
            <input type="text" name="urlfoto" placeholder="URL da Foto" />
            <button type="submit">Cadastrar Produto</button>
          </form>
        </div>
      )}

      {/* 🔹 Lista de produtos (visível pra todos) */}
      <div className="container-produtos">
        {produtos.map((produto) => (
          <div key={produto._id} className="produto">
            <img src={produto.urlfoto} alt={produto.nome} />
            <h2>{produto.nome}</h2>
            <p>{produto.descricao}</p>
            <p>
              <strong>R$ {produto.preco}</strong>
            </p>

            {/* 🔒 Botão de adicionar só aparece se logado */}
            {token && (
              <button onClick={() => adicionarItemCarrinho(produto._id)}>
                Adicionar ao Carrinho
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
