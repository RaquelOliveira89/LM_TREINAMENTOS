/* ============================================
   LM TREINAMENTOS
   Canal de Denúncias
============================================ */

document.addEventListener("DOMContentLoaded", () => {

    // Inicializa animações
    if (typeof AOS !== "undefined") {
        AOS.init({
            duration: 800,
            once: true
        });
    }

    const form = document.getElementById("formDenuncia");
    const anonima = document.getElementById("anonima");

    const nome = document.getElementById("nome");
    const email = document.getElementById("email");
    const telefone = document.getElementById("telefone");

    const descricao = document.querySelector("textarea");

    //==========================================
    // DENÚNCIA ANÔNIMA
    //==========================================

    anonima.addEventListener("change", function () {

        if (this.checked) {

            nome.disabled = true;
            email.disabled = true;
            telefone.disabled = true;

            nome.value = "";
            email.value = "";
            telefone.value = "";

        } else {

            nome.disabled = false;
            email.disabled = false;
            telefone.disabled = false;

        }

    });

    //==========================================
    // MÁSCARA TELEFONE
    //==========================================

    telefone.addEventListener("input", function (e) {

        let value = e.target.value.replace(/\D/g, "");

        if (value.length > 11)
            value = value.substring(0, 11);

        value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
        value = value.replace(/(\d)(\d{4})$/, "$1-$2");

        e.target.value = value;

    });

    //==========================================
    // CONTADOR DE CARACTERES
    //==========================================

    const contador = document.createElement("small");

    contador.className = "text-muted";

    contador.innerHTML = "0 caracteres";

    descricao.parentNode.appendChild(contador);

    descricao.addEventListener("input", () => {

        contador.innerHTML =
            descricao.value.length + " caracteres";

    });

    //==========================================
    // VALIDAÇÃO
    //==========================================

    form.addEventListener("submit", function (e) {

        const tipo = document.querySelector("select").value;

        if (tipo === "") {

            e.preventDefault();

            alert("Selecione o tipo da denúncia.");

            return;

        }

        if (descricao.value.trim().length < 20) {

            e.preventDefault();

            alert("Descreva melhor o ocorrido (mínimo de 20 caracteres).");

            descricao.focus();

            return;

        }

        // Validação passou: o formulário segue seu envio normal ao FormSubmit
        const botao = form.querySelector("button");

        botao.disabled = true;

        botao.innerHTML = `
        <span class="spinner-border spinner-border-sm"></span>
        Enviando denúncia...
        `;

    });

});