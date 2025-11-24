describe('Teste De Fluxo', () => {
    beforeEach(()=>{
        cy.visit('https://agendamento.quarkclinic.com.br/index/363622206');
    })
    it('Cadastro', () => {
        cy.get('[data-cy="btn-footer-entendi"]').click();
    
        cy.fixture("dados")
        .then(user =>{
            
            cy.get('[data-cy="btn-cadastro"]').click();

            cy.get('[data-cy="card-formulario-cadastro"]').find('[data-cy="campo-nome-input"]').type(user.nome);

            cy.get('[data-cy="card-formulario-cadastro"]').find('[data-cy="campo-telefone-input"]').type(user.celular);

            cy.get('[data-cy="card-formulario-cadastro"]').find('[data-cy=campo-sexo-select]').select(user.sexo);

            cy.get('[data-cy="card-formulario-cadastro"]').find('[data-cy="campo-data-nascimento-input"]').type(user.data_nasc);

            cy.get('[data-cy="card-formulario-cadastro"]').find('[data-cy="campo-email-input"]').type(user.email);
        
            cy.get('[data-cy="card-formulario-cadastro"]').find('[data-cy="campo-tipo-documento-select"]').select("CPF");
            
            cy.get('[data-cy="card-formulario-cadastro"]').find('[data-cy="campo-numero-documento-input"]').type(user.cpf);

            cy.get('[data-cy="card-formulario-cadastro"]').find('[data-cy="campo-senha-input"').type(user.senha);

            cy.get('[data-cy="card-formulario-cadastro"]').find('[data-cy="campo-confirmar-senha-input"').type(user.senha);

            cy.intercept('POST','/api/social/usuarios').as('postCadastro')
            cy.get('[data-cy="card-formulario-cadastro"]').find('[data-cy="checkbox-aceita-politicas-cadastro"').click();
            
            cy.get('[data-cy="card-formulario-cadastro"]').find('[data-cy="btn-criar-conta"').click();
            cy.intercept('GET','api/protected/me').as('getCadastro');
            cy.wait("@postCadastro");

            cy.get('[data-cy="header-col-acoes"]').find('[data-cy="dropdown-usuario-logado"]').click();
            cy.wait('@getCadastro');
        
            cy.get('[data-cy="dropdown-usuario-logado"]').should('be.visible');
            cy.log("Home Page Logada")

            let nome = user.nome.split(" ");
            cy.contains(nome[0]).should('be.visible');
            cy.log("Nome Visivel");
                    
            cy.get('[data-cy="dropdown-usuario-logado"]').find('[data-cy="dropdown-item-sair-logado"]').click();
        
           
            
        });

    });
    it("Login",()=>{
        cy.get('[data-cy="btn-footer-entendi"]').click();
        cy.fixture("dados")
        .then(user =>{
            cy.get('[data-cy="btn-login"]').click();

            cy.get('[data-cy="form-login"]').find('[data-cy="campo-usuario-input"').type(user.email);

            cy.get('[data-cy="form-login"]').find('[data-cy="campo-senha-input"').type(user.senha);

            cy.get('[data-cy="form-login"]').find('[data-cy="checkbox-aceita-politicas"').click();

            cy.intercept('POST','/api/auth/login').as('postLogin');
            cy.get('[data-cy="form-login"]').find('[data-cy="btn-submit-login"').click();
            cy.intercept('GET','api/protected/me').as('getLogin');

            cy.wait("@postLogin");
            cy.log("Home Page");
            cy.wait("@getLogin");

            cy.get('[data-cy="dropdown-usuario-logado"]').should('be.visible');
            
            let nome = user.nome.split(" ");

            cy.contains(nome[0]).should('be.visible');
            cy.log("Nome Visivel");

        });
            
        //Teste Agendar Consulta
        cy.get('[data-cy="container-btn-consulta-presencial"]').find('[data-cy="btn-consulta-presencial"]').click();

        cy.get('[data-cy="agendamento-inner-row"]').find('[data-cy="convenio-label-148"]').click();

        let data;
        let hora;

        cy.get('[data-cy="agendamento-container"]').find('[data-cy="agenda-main-header"]').invoke('text').then(($value) => {
            data = $value.trim().split('-',2);
            cy.log(data);
        })

        cy.get('[data-cy="agenda-item-horarios-container"]').find('div').first('div').invoke('text').then(($value) => {
            hora = $value.trim();
            cy.log(hora);
        })

        cy.get('[data-cy="agenda-item-horarios-container"]').find('div').first().click();
        
        cy.get('[data-cy="pacientes-list-row"]').find('[data-cy="paciente-card-nome"]').click();

        //validação dos campos
        cy.get('[data-cy="confirmacao-table"]').find('[data-cy="confirmacao-paciente"]').should('not.be.empty');

        cy.get('[data-cy="confirmacao-table"]').find('[data-cy="confirmacao-clinica"]').should('not.be.empty');

        cy.get('[data-cy="confirmacao-table"]').find('[data-cy="confirmacao-especialidade"]').should('not.be.empty');

        cy.get('[data-cy="confirmacao-table"]').find('[data-cy="confirmacao-procedimento"]').should('not.be.empty');

        cy.get('[data-cy="confirmacao-table"]').find('[data-cy="confirmacao-profissional"]').should('not.be.empty');

        cy.get('[data-cy="confirmacao-table"]').find('[data-cy="confirmacao-datahora"]').should('not.be.empty');

        cy.get('[data-cy="confirmacao-table"]').find('[data-cy="confirmacao-convenio"]').should('not.be.empty');

        cy.get('[data-cy="confirmacao-table"]').find('[data-cy="confirmacao-valor"]').should('not.be.empty');

        cy.get('[data-cy="confirmacao-table"]').find('[data-cy="confirmacao-localização"]').should('not.be.empty');

        // Teste Verifica data e hora
        let dataHoraConfirmação;
        cy.get('[data-cy="confirmacao-table"]').find('[data-cy="confirmacao-datahora"]').invoke('text').then(($value) =>{
            dataHoraConfirmação = $value.split('-',2);
            cy.log(dataHoraConfirmação);

            expect(data[0].trim()).be.equal(dataHoraConfirmação[0].trim());

            expect(hora).be.equal(dataHoraConfirmação[1].trim());

        })

        //Teste Confirmação
        cy.intercept('POST','api/protected/me/agendamentos').as('postAgendamento')
        cy.get('[data-cy="agendamento-inner-row"]').find('[data-cy="confirmacao-btn-confirmar"]').click();

        cy.wait("@postAgendamento");
        cy.contains('Agendamento efetuado').should('be.visible');

        cy.intercept('GET','api/geral/*').as('getInstrucao');
        cy.get('[data-cy="finalizacao-card-body"]').find('[data-cy="finalizacao-btn-transferencia"]').click();

        //Teste Comprovante
        cy.wait('@getInstrucao');
        cy.get('[data-cy="pagamento-form"]').find('input[type=file]').selectFile('teste.jpeg');

        cy.get('[data-cy="pagamento-form-group-observacao"]').find('[data-cy="pagamento-form-textarea-observacao"]').type("Comprovante de teste");
        
        cy.intercept('POST','api/protected/me/comprovante').as('postComprovante');
       
        cy.get('[data-cy="pagamento-form"]').find('[data-cy="pagamento-form-btn-enviar"]').click();

        cy.wait('@postComprovante');
        cy.contains('Obrigado por enviar! Iremos analisar!').should('be.visible');
        
    })
})