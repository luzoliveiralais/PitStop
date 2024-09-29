//Conectando o puppeteer e o Google APIs
const puppeteer = require('puppeteer');
const { google } = require('googleapis');

//Utilizando a chave de acesso
const creds = require('./pitstophcc-c476cb14cda9.json');


//método assíncrono principal
(async () => {
    //Abrindo o zap zap 
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://web.whatsapp.com/');
    await delay(60000); //Tempo de espera inicial para a pessoa conectar o Whatsapp Web

    //While para realizar consultas periódicas na planilha
    while (true){
        await delay(5000);

        //Acessando a planilha e seus campos
        const auth = await google.auth.getClient({
            credentials: creds,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = '1UBaVjEZC5PnZ-mleXT9TyYAg-S0PTT65j6YvxtcC8xU';
        const range = 'Planilha1!B2:F1000';
        let linha = 2;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range
        });
        const rows = response.data.values;
       
        //Laço que analisa cada linha da planilha, procurando por números em que a mensagem ainda não foi enviada
        for(const row of rows){
            //poderia ser substituido as duas linhas abaixo para const [ phone,name ] = row , melhora a perfarmace usando a desestruturação
            const phone = row[1];
            const name = row[0];
            let phoneCorrected = phone.replace(/[ ()+-.,@?#$%&*!]/g, "");
            const codigoAleatorio = Math.floor(Math.random() * 900) + 100;
            const message = "Oiezinho, seja bem-vindo ao HCC e obrigada por se cadastrar! Seu código de cadastro é: HCC" + codigoAleatorio;
            if (phone === ''){
                console.log(i);
                break;
            }
            if (phoneCorrected.startsWith("55")){
                phoneCorrected = phoneCorrected.slice(2);
            }
            
            if (row[3] != 1){
                try{
                    await page.goto('https://web.whatsapp.com/send?phone=+55' + phoneCorrected + '&text='+ message);
                    await delay(10000);
                    await page.click('div[role="textbox"][contenteditable="true"][data-tab="10"]');
                    await page.keyboard.press('Enter');
                    await delay(1000);
                }catch(error){
                    if (phoneCorrected.length < 11){
                        console.log("Número incompleto ou sem DDD! " + name + "-" + phoneCorrected)

                    }
                    else {
                        console.log("Número não encontrado! " + name + "-" + phoneCorrected)
                    }
                }

                //Parte que insere o número 1 na coluna E, fazendo com que o código ignore ele da próxima vez
                const rangeToUpdate = 'Planilha1!E' + linha; 
                const valueToAdd = 1; 
                const updateRequest = { 
                    spreadsheetId, 
                    range: rangeToUpdate, 
                    valueInputOption: 'USER_ENTERED', 
                    resource: { 
                        values: [[valueToAdd]] 
                    } 
                }; 

                const newResponse = await sheets.spreadsheets.values.update(updateRequest);

                //Parte que insere o código na planilha na coluna F
                const rangeToUpdateCode = 'Planilha1!F' + linha; 
                const valueToAddCode = codigoAleatorio; 
                const updateRequestCode = { 
                    spreadsheetId, 
                    range: rangeToUpdateCode, 
                    valueInputOption: 'USER_ENTERED', 
                    resource: { 
                        values: [[valueToAddCode]] 
                    } 
                }; 

                const newResponseCode = await sheets.spreadsheets.values.update(updateRequestCode);
            }
            linha++;
        }
    }
})();

//Função para fazer o programa pausar por tempo determinado
function delay(time){
    return new Promise(function (resolve){
        setTimeout(resolve,time);
    });
}