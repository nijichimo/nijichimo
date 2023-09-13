//cal rank from score
function is_Rank(x){
    if(x<975000){
        return 'None';
    }
    if(x<1000000){
        return 'S';
    }
    if(x<1005000){
        return 'SS';
    }
    if(x<1007500){
        return 'SS+';
    }
    if(x<1010000){
        return 'SSS';
    }
    return 'MAX';
}

//cal overpower from const,score,rank,clear flag,fullCcombo_flag,AllJustice_flag
function op_cal(con,score,rank,fc,aj){
    let OP=0;
    if(score!=0){
        OP += con*5;
    }else{
        return 0;
    }
    
    if (rank == 'None'){
        OP+=0;
    }else if(rank =='S'){
        OP+=(score - 975000) * 0.0002;
    }else if(rank =='SS'){
        OP+=(score - 1000000) * 0.0005 + 0.5;
    }else if(rank =='SS+'){
        OP+=(score-1005000) * 0.001 + 0.75;
    }else if(rank =='SSS'){
        OP+=(score-1007500) * 0.0015 +10;
    }else if(rank =='MAX'){
        OP+=14;
    }
    
    if(fc)OP+=0.5;
    if(aj)OP+=0.5;
    
    return Math.floor(OP*10000)/10000;
}

//cal Theoretical overpower
function op_max(con){
    return (con+3)*5;
}

async function main(){
    //make endpoint
    let user = 'user_name=';
    const region = 'region=jp2';
    //this is creater token
    //if your account is private,when please change your token 
    const API_Token = 'token=ba592100f64e49868a03afd91ae1fce496f62a5de756086a117ef581e9a8f6158242873c83c739572e10e9e14c2c12b6c7a0417a99d0bc7fbdb78b3441dfe930';
    //user_id = document.getname.user_id.value;
    user+=user_name.value
    const API_Endpoint = 'https://api.chunirec.net/2.0/records/showall.json?' + user + '&' + region + '&' + API_Token;

    //call API and Assign to "recoreds" as String
    const response = await fetch(API_Endpoint).then(response => response.json());
    let records = [];
    records = response.records;
    for(let i=0;i<records.length;i++){
        if(records[i].diff=='EXP' || records[i].diff=='ADV' || records[i].diff=='BAS'){
            delete records[i];
            continue;
        };
        
        delete records[i].id;
        delete records[i].rating;
        delete records[i].is_const_unknown;
        delete records[i].is_played;
        delete records[i].is_fullchain;
        delete records[i].updated_at;
        
        records[i].rank = is_Rank(records[i].score);
        records[i].op = op_cal(records[i].const,records[i].score,records[i].rank,records[i].is_fullcombo,records[i].is_alljustice);
        records[i].op_max=op_max(records[i].const);
        records[i].op_percentage=Math.round(records[i].op/records[i].op_max*10000)/100;
    }
    records = records.filter(Boolean);

    //Assign to "json_result" as JSON
    const json_result = JSON.stringify(records);
    /*
    const header = Object.keys(records[0]);
    const headerString = header.join(',');
    
    const replacer = (key,value) => value ?? '';
    const rowItems = records.map(row=>header.map(fildName=>JSON.stringify(row[fildName],replacer)).join(','));
    
    const csv_string = [headerString, ...rowItems].join('\n');
    
    let csv_buf = csv_string.split('\n');
    let csv_arr = []
    for(let i=0;i<csv_buf.length;i++){
        csv_arr[i] = csv_buf[i].split(',');
    }
    
    console.log(csv_arr);
    */

    console.log(json_result)

    //make table to "table"
    //if change maketable fromID,change this code
    records.sort((a,b) => a.op_percentage-b.op_percentage);
    let table = document.createElement("table");
    let tr = document.createElement("tr");
    for(key in records[0]){
        let th = document.createElement('th');
        th.textContent = key;
        tr.appendChild(th);
    }
    table.appendChild(tr);
    
    for(var i=0;i<records.length;i++){
        let tr = document.createElement("tr");
        for(key in records[0]){
            td=document.createElement("td");
            td.textContent = records[i][key];
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    document.getElementById("table").appendChild(table);

    //make graph use chart.js
    let graph_deta = [];
    let graph_xy = [];

    //sort graph_data in ascending
    for(let i=0;i<records.length;i++){
        graph_deta[i]=records[i].op_percentage;
    }
    graph_deta.sort((a,b) => a-b);
    
    for(let i =0;i<records.length;i++){
        let dict = new Object();
        dict.x=i;
        dict.y=graph_deta[i];
        graph_xy[i]=dict;
    }
    console.log(graph_xy);
    
    let canvas = document.getElementById("canvas");
    var scatter = new Chart(canvas,{
        type:"scatter",
        data: {
            datasets: [{
                label: 'OP',
                data: graph_xy,
                backgroundColor: 'rgb(0,0,0)'
            }],
        },
        options:{
            scales:{
                x:{min:0,max:graph_xy.length},
                y:{min:graph_xy[0].y-5,max:100},
            },
        },
    })
}

let user_name = document.getElementById("user_id");

let checkButton = document.getElementById("get_user_id")
checkButton.addEventListener('click', main);

let csv_table =document.getElementById("csv_table");
