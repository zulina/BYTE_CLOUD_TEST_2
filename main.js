const manWidth = 21, manHeight = 48;
let choosed = 0;

const users = [
    {left: 270, bottom: 380, left_s: 310, bottom_s: 395, left_m: 255, bottom_m: 365, left_l: 205, bottom_l: 390, place: "North America"},
    {left: 390, bottom: 170, left_s: 420, bottom_s: 170, left_m: 395, bottom_m: 120, left_l: 355, bottom_l: 205, place: "South America"},
    {left: 690, bottom: 410, left_s: 665, bottom_s: 405, left_m: 575, bottom_m: 375, left_l: 740, bottom_l: 440, place: "Europe"},
    {left: 940, bottom: 320, left_s: 970, bottom_s: 320, left_m: 850, bottom_m: 290, left_l: 1025, bottom_l: 390, place: "Asia"},
    {left: 1050, bottom: 130, left_s: 1100, bottom_s: 115, left_m: 995, bottom_m: 125, left_l: 1045, bottom_l: 120, place: "Oceania"},
];

const data = [
    {left: 170, bottom: 360},
    {left: 370, bottom: 370},
    {left: 620, bottom: 405},
    {left: 970, bottom: 190}
];

let connect = [];

let connectDivs = []; // текущие соединения

let connectText = []; // расположение текстов соединений

let masks = []; // маски для прогресса соединения
let texts = [];

let resultData = [];

const map = document.getElementsByClassName("map")[0],
    message = document.getElementById("message"),
    next = document.getElementById("next"),
    start = document.getElementById("start"),
    result = document.getElementById("result"),
    result_body = document.getElementById("result_body");

function deleteMen() {
    users.forEach(item => {
        item["man_small"].remove();
        item["man_medium"].remove();
        item["man_large"].remove();
        delete item["man_small"];
        delete item["man_medium"];
        delete item["man_large"];
    });
}

function deleteStorages() {
    data.forEach(item => {
        item["storage"].remove();
        delete item["storage"];
    });
}

function deleteUsers() {
    users.forEach(item => {
        if (item["small"].style.display === "none") {
            item["small"].remove();
            delete item["small"];
        }
        if (item["medium"].style.display === "none") {
            item["medium"].remove();
            delete item["medium"];
        }
        if (item["large"].style.display === "none") {
            item["large"].remove();
            delete item["large"];
        }
    });
}

function deleteConnectDivs() {
    connectDivs.forEach(item => {
        item.remove();
    });
    connectDivs = [];
}

function deleteTexts() {
    texts.forEach(item => {
        item.text.remove();
    });
    texts = [];
}

function deleteMasks() {
    masks.forEach(item => {
        item.mask.remove();
    });
    masks = [];
}

function displayNone(item1, item2, item3) {
    item1.style.display = "none";
    item2.style.display = "none";
    item3.style.display = "none";
}

function checkChoosed() {
    choosed++;
    if (choosed === 1) {
        next.style.display="inline";
    }
    if (choosed === 5) {
        secondStep();
    }
}

function createConnectText(user, latency, time) {
    const connect_text = document.createElement("span");
    connect_text.classList.add("connect_text");
    connectText.some(item => {
        if (item.user === user) {
            connect_text.style.left = `${item.left}px`;
            connect_text.style.bottom = `${item.bottom}px`;        
            return true;
        }
    });
    map.append(connect_text);  
    texts.push({text: connect_text, latency: latency, time: time});
}

function createConnect(connectUser, classServer) {

    let maxTime = 1000;
    let connectItem = "";

    // ищем лучшее соединение
    connect.filter(item => 
        (item.user === connectUser && item.server && (classServer === "server_BC" || item.server.classList.contains(classServer)))).forEach(item => {
        if (item.latency + item.time < maxTime) {
            maxTime = item.latency + item.time;
            connectItem = item;
        }
    });

    const connectDiv = document.createElement("div");
    connectDiv.classList.add("connect")
    connectDiv.style.background = `url(${connectItem.img}) center / contain  no-repeat`;
    map.append(connectDiv);
    connectDivs.push(connectDiv);

    if (!resultData.some(res_item => (res_item.place === connectItem.user.getAttribute("data-place") && res_item.server === classServer))) {
        // добавляем соединение в результирующие данные
        resultData.push({place: connectItem.user.getAttribute("data-place"), server: classServer, latency: connectItem.latency, time: connectItem.time});
        // создаём текстовую подпись для соединения
        createConnectText(connectItem.user, connectItem.latency, connectItem.time);
    }

    return connectItem;
}

function createMask(left, bottom, connectItem, maskClass) {

    const maskDiv = document.createElement("div");
    maskDiv.classList.add("mask")
    maskDiv.style.left = `${left}px`;
    maskDiv.style.bottom = `${bottom}px`;
    map.append(maskDiv);
    masks.push({mask: maskDiv, latency: connectItem.latency, time: connectItem.time});

    const mask = document.createElement("div");
    mask.classList.add(maskClass)
    maskDiv.append(mask);

}

function calculateTime(latency, time) {
    return Math.round((latency + time) / 60) * 1000;
}

function getStars(latency, time) {
    let htmlText = "";
    if (time + latency < 150) {
        htmlText = "<span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span>"
    } else if (time + latency < 270) {
        htmlText = "<span>&#9734;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span>"
    } else if (time + latency < 390) {
        htmlText = "<span>&#9734;</span><span>&#9734;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span>"
    } else if (time + latency < 510) {
        htmlText = "<span>&#9734;</span><span>&#9734;</span><span>&#9734;</span><span>&#9733;</span><span>&#9733;</span>"
    } else {
        htmlText = "<span>&#9734;</span><span>&#9734;</span><span>&#9734;</span><span>&#9734;</span><span>&#9733;</span>"
    }
    return htmlText;
}

function fifthStep() {

    message.textContent = "Do you want to start again?"

    const resForServerBC = resultData.filter(item => item.server === "server_BC").sort((a, b) => a.place > b.place ? 1 : -1);
    const resForServer = resultData.filter(item => item.server === "server").sort((a, b) => a.place > b.place ? 1 : -1);
    let result_body_html = "";

    for(let i=0; i<resForServer.length; i++) {
        result_body_html = result_body_html + `
        <tr>
            <th colspan="2" width="240">${resForServerBC[i].place}</th>
            <th width="160" class="stars">${getStars(resForServerBC[i].latency, resForServerBC[i].time)}</th>
            <th colspan="2" width="240">${resForServer[i].place}</th>
            <th width="160" class="stars">${getStars(resForServer[i].latency, resForServer[i].time)}</th>
        </tr>
        <tr>
            <td width="80">Latency<br>${resForServerBC[i].latency}</td>
            <td width="160">Download time<br>${resForServerBC[i].time}</td>
            <td width="160">Video streaming<br>1080p Full HD</td>
            <td width="80">Latency<br>${resForServer[i].latency}</td>
            <td width="160">Download time<br>${resForServer[i].time}</td>
            <td width="160">Video streaming<br>1080p Full HD</td>
        </tr>
        <tr>
            <th colspan="6" class="table_indent"></th>
        </tr>
        `;
    }

    result_body.innerHTML = result_body_html;
    result.style.backdropFilter = "blur(7px)";
    result.style.display = "block";

}

function fourthStep() {

    deleteConnectDivs();
    deleteTexts();
    deleteMasks();

    message.textContent = "Object Storage";

    users.forEach(user => {
        if (user["small"]) {
            const connectItem = createConnect(user["small"], "server");   
            createMask(user["left_s"], user["bottom_s"], connectItem, "mask_small");
        }
        if (user["medium"]) {
            const connectItem = createConnect(user["medium"], "server");
            createMask(user["left_m"], user["bottom_m"], connectItem, "mask_medium");
        }
        if (user["large"]) {
            const connectItem = createConnect(user["large"], "server");
            createMask(user["left_l"], user["bottom_l"], connectItem, "mask_large");
        }
    });

    let maxTime = 0, curTime = 0;

    masks.forEach(item => {
        createConnectAnimation(item.mask, calculateTime(item.latency, item.time));
    });

    texts.forEach(item => {
        curTime = calculateTime(item.latency, item.time);
        maxTime = maxTime < curTime ? curTime : maxTime;
        item.text.textContent = `Latency: ${item.latency}`;
        setTimeout(() => {
            item.text.textContent = `Time: ${item.time}`;
        }, curTime);
    });

    setTimeout(() => {
        fifthStep();
    }, maxTime + 1000);

}

function thirdStep() {

    deleteStorages();

    message.textContent = "Byte Cloud";
    start.style.display = "none";

    connect = [
        {user: users[0]["small"], server: data[0]["server"], img: "./elements/arc_west-usa_north-america_small.png", latency: 59, time: 28},
        {user: users[0]["small"], server: data[1]["server"], img: "./elements/arc_east-usa_north-america_small.png", latency: 23, time: 9},
        {user: users[0]["small"], server: data[2]["server"], img: "./elements/arc_germany_north-america_small.png", latency: 100, time: 70},
        {user: users[0]["small"], server: data[3]["server"], img: "./elements/arc_singapore_north-america_small.png", latency: 210, time: 145}, // ?
        {user: users[0]["medium"], server: data[0]["server"], img: "./elements/arc_west-usa_north-america_medium.png", latency: 59, time: 28},
        {user: users[0]["medium"], server: data[1]["server"], img: "./elements/arc_east-usa_north-america_medium.png", latency: 23, time: 9},
        {user: users[0]["medium"], server: data[2]["server"], img: "./elements/arc_germany_north-america_medium.png", latency: 100, time: 70},
        {user: users[0]["medium"], server: data[3]["server"], img: "./elements/arc_singapore_north-america_medium.png", latency: 210, time: 145}, // ?
        {user: users[0]["large"], server: data[0]["server"], img: "./elements/arc_west-usa_north-america_large.png", latency: 59, time: 28},
        {user: users[0]["large"], server: data[1]["server"], img: "./elements/arc_east-usa_north-america_large.png", latency: 23, time: 9},
        {user: users[0]["large"], server: data[2]["server"], img: "./elements/arc_germany_north-america_large.png", latency: 100, time: 70},
        {user: users[0]["large"], server: data[3]["server"], img: "./elements/arc_singapore_north-america_large.png", latency: 210, time: 145}, // ?
        {user: users[1]["small"], server: data[0]["server"], img: "./elements/arc_west-usa_south-america_small.png", latency: 185, time: 101},
        {user: users[1]["small"], server: data[1]["server"], img: "./elements/arc_east-usa_south-america_small.png", latency: 205, time: 95}, // ?
        {user: users[1]["small"], server: data[2]["server"], img: "./elements/arc_germany_south-america_small.png", latency: 214, time: 92},
        {user: users[1]["small"], server: data[3]["server"], img: "./elements/arc_singapore_south-america_small.png", latency: 280, time: 150}, // ?
        {user: users[1]["medium"], server: data[0]["server"], img: "./elements/arc_west-usa_south-america_medium.png", latency: 185, time: 101},
        {user: users[1]["medium"], server: data[1]["server"], img: "./elements/arc_east-usa_south-america_medium.png", latency: 205, time: 95}, // ?
        {user: users[1]["medium"], server: data[2]["server"], img: "./elements/arc_germany_south-america_medium.png", latency: 214, time: 92},
        {user: users[1]["medium"], server: data[3]["server"], img: "./elements/arc_singapore_south-america_medium.png", latency: 280, time: 150}, // ?
        {user: users[1]["large"], server: data[0]["server"], img: "./elements/arc_west-usa_south-america_large.png", latency: 185, time: 101},
        {user: users[1]["large"], server: data[1]["server"], img: "./elements/arc_east-usa_south-america_large.png", latency: 205, time: 95}, // ?
        {user: users[1]["large"], server: data[2]["server"], img: "./elements/arc_germany_south-america_large.png", latency: 214, time: 92},
        {user: users[1]["large"], server: data[3]["server"], img: "./elements/arc_singapore_south-america_large.png", latency: 280, time: 150}, // ?
        {user: users[2]["small"], server: data[0]["server"], img: "./elements/arc_west-usa_europe_small.png", latency: 155, time: 65}, // ?
        {user: users[2]["small"], server: data[1]["server"], img: "./elements/arc_east-usa_europe_small.png", latency: 85, time: 62},
        {user: users[2]["small"], server: data[2]["server"], img: "./elements/arc_germany_europe_small.png", latency: 11, time: 5},
        {user: users[2]["small"], server: data[3]["server"], img: "./elements/arc_singapore_europe_small.png", latency: 145, time: 60}, // ?
        {user: users[2]["medium"], server: data[0]["server"], img: "./elements/arc_west-usa_europe_medium.png", latency: 155, time: 65}, // ?
        {user: users[2]["medium"], server: data[1]["server"], img: "./elements/arc_east-usa_europe_medium.png", latency: 85, time: 62},
        {user: users[2]["medium"], server: data[2]["server"], img: "./elements/arc_germany_europe_medium.png", latency: 11, time: 5},
        {user: users[2]["medium"], server: data[3]["server"], img: "./elements/arc_singapore_europe_medium.png", latency: 145, time: 60}, // ?
        {user: users[2]["large"], server: data[0]["server"], img: "./elements/arc_west-usa_europe_large.png", latency: 155, time: 65}, // ?
        {user: users[2]["large"], server: data[1]["server"], img: "./elements/arc_east-usa_europe_large.png", latency: 85, time: 62},
        {user: users[2]["large"], server: data[2]["server"], img: "./elements/arc_germany_europe_large.png", latency: 11, time: 5},
        {user: users[2]["large"], server: data[3]["server"], img: "./elements/arc_singapore_europe_large.png", latency: 145, time: 60}, // ?
        {user: users[3]["small"], server: data[0]["server"], img: "./elements/arc_west-usa_asia_small.png", latency: 300, time: 120}, // ?
        {user: users[3]["small"], server: data[1]["server"], img: "./elements/arc_east-usa_asia_small.png", latency: 240, time: 90}, // ?
        {user: users[3]["small"], server: data[2]["server"], img: "./elements/arc_germany_asia_small.png", latency: 149, time: 61},
        {user: users[3]["small"], server: data[3]["server"], img: "./elements/arc_singapore_asia_small.png", latency: 73, time: 41},
        {user: users[3]["medium"], server: data[0]["server"], img: "./elements/arc_west-usa_asia_medium.png", latency: 300, time: 120}, // ?
        {user: users[3]["medium"], server: data[1]["server"], img: "./elements/arc_east-usa_asia_medium.png", latency: 240, time: 90}, // ?
        {user: users[3]["medium"], server: data[2]["server"], img: "./elements/arc_germany_asia_medium.png", latency: 149, time: 61},
        {user: users[3]["medium"], server: data[3]["server"], img: "./elements/arc_singapore_asia_medium.png", latency: 73, time: 41},
        {user: users[3]["large"], server: data[0]["server"], img: "./elements/arc_west-usa_asia_large.png", latency: 300, time: 120}, // ?
        {user: users[3]["large"], server: data[1]["server"], img: "./elements/arc_east-usa_asia_large.png", latency: 240, time: 90}, // ?
        {user: users[3]["large"], server: data[2]["server"], img: "./elements/arc_germany_asia_large.png", latency: 149, time: 61},
        {user: users[3]["large"], server: data[3]["server"], img: "./elements/arc_singapore_asia_large.png", latency: 73, time: 41},
        {user: users[4]["small"], server: data[0]["server"], img: "./elements/arc_west-usa_oceania_small.png", latency: 500, time: 320}, // ?
        {user: users[4]["small"], server: data[1]["server"], img: "./elements/arc_east-usa_oceania_small.png", latency: 430, time: 290}, // ?
        {user: users[4]["small"], server: data[2]["server"], img: "./elements/arc_germany_oceania_small.png", latency: 266, time: 165},
        {user: users[4]["small"], server: data[3]["server"], img: "./elements/arc_singapore_oceania_small.png", latency: 93, time: 63},
        {user: users[4]["medium"], server: data[0]["server"], img: "./elements/arc_west-usa_oceania_medium.png", latency: 500, time: 320}, // ?
        {user: users[4]["medium"], server: data[1]["server"], img: "./elements/arc_east-usa_oceania_medium.png", latency: 430, time: 290}, // ?
        {user: users[4]["medium"], server: data[2]["server"], img: "./elements/arc_germany_oceania_medium.png", latency: 266, time: 165},
        {user: users[4]["medium"], server: data[3]["server"], img: "./elements/arc_singapore_oceania_medium.png", latency: 93, time: 63},
        {user: users[4]["large"], server: data[0]["server"], img: "./elements/arc_west-usa_oceania_large.png", latency: 500, time: 320}, // ?
        {user: users[4]["large"], server: data[1]["server"], img: "./elements/arc_east-usa_oceania_large.png", latency: 430, time: 290}, // ?
        {user: users[4]["large"], server: data[2]["server"], img: "./elements/arc_germany_oceania_large.png", latency: 266, time: 165},
        {user: users[4]["large"], server: data[3]["server"], img: "./elements/arc_singapore_oceania_large.png", latency: 93, time: 63},
    ];

    connectText = [
        {user: users[0]["small"], left: users[0]["left"]-25, bottom: users[0]["bottom"]-50},
        {user: users[0]["medium"], left: users[0]["left"]-25, bottom: users[0]["bottom"]-50},
        {user: users[0]["large"], left: users[0]["left"]-25, bottom: users[0]["bottom"]-50},
        {user: users[1]["small"], left: users[1]["left"]-20, bottom: users[1]["bottom"]-80},
        {user: users[1]["medium"], left: users[1]["left"]-20, bottom: users[1]["bottom"]-80},
        {user: users[1]["large"], left: users[1]["left"]-20, bottom: users[1]["bottom"]-80},
        {user: users[2]["small"], left: users[2]["left"]-25, bottom: users[2]["bottom"]-50},
        {user: users[2]["medium"], left: users[2]["left"]-25, bottom: users[2]["bottom"]-50},
        {user: users[2]["large"], left: users[2]["left"]-25, bottom: users[2]["bottom"]-50},
        {user: users[3]["small"], left: users[3]["left"]+10, bottom: users[3]["bottom"]-50},
        {user: users[3]["medium"], left: users[3]["left"]+10, bottom: users[3]["bottom"]-50},
        {user: users[3]["large"], left: users[3]["left"]+10, bottom: users[3]["bottom"]-50},
        {user: users[4]["small"], left: users[4]["left"]-20, bottom: users[4]["bottom"]-50},
        {user: users[4]["medium"], left: users[4]["left"]-20, bottom: users[4]["bottom"]-50},
        {user: users[4]["large"], left: users[4]["left"]-20, bottom: users[4]["bottom"]-50},
    ];

    users.forEach(user => {
        if (user["small"]) {
            const connectItem = createConnect(user["small"], "server_BC");   
            createMask(user["left_s"], user["bottom_s"], connectItem, "mask_small");
        }
        if (user["medium"]) {
            const connectItem = createConnect(user["medium"], "server_BC");
            createMask(user["left_m"], user["bottom_m"], connectItem, "mask_medium");
        }
        if (user["large"]) {
            const connectItem = createConnect(user["large"], "server_BC");
            createMask(user["left_l"], user["bottom_l"], connectItem, "mask_large");
        }
    });

    let maxTime = 0, curTime = 0;

    masks.forEach(item => {
        createConnectAnimation(item.mask, calculateTime(item.latency, item.time));
    });

    texts.forEach(item => {
        curTime = calculateTime(item.latency, item.time);
        maxTime = maxTime < curTime ? curTime : maxTime;
        item.text.textContent = `Latency: ${item.latency}`;
        setTimeout(() => {
            item.text.textContent = `Time: ${item.time}`;
        }, curTime);
    });

    setTimeout(() => {
        fourthStep();
    }, maxTime + 1000);
}

function createConnectAnimation(mask, time) {
    mask.animate([
        {
            width: "0px"
        },
        {
            width: "15px"
        },
        {
            width: "30px"
        },
        {
            width: "45px"
        }
    ], {
        duration: time,
        iterations: 1
    });
}

function secondStep() {

    deleteMen();
    deleteUsers();

    message.textContent = "Where is your data? Choose one spot for Object Storage system";
    next.style.display = "none";
    start.addEventListener("click", () => {
        data.forEach(item => {
            item["storage"].style.display = "none";
        });
        thirdStep();
    });

    choosed = 0;

    data.forEach(item => {

        item["storage"] = document.createElement("div");
        item["storage"].classList.add("data");
        item["storage"].style.left = `${item["left"]}px`;
        item["storage"].style.bottom = `${item["bottom"]}px`;
        map.append(item["storage"]);
        
        item["storage"].addEventListener("click", (e) => {
            choosed++;
            item["server"] = document.createElement("div");
            if (choosed === 1) {
                item["server"].classList.add("server");
            } else {
                item["server"].classList.add("server_BC");
            }
            item["server"].style.left = `${item["left"]}px`;
            item["server"].style.bottom = `${item["bottom"]}px`;
            item["server"].style.display = "block";
            map.append(item["server"]);    
            item["storage"].style.display = "none";
            if (choosed === 3) {
                start.style.display="inline";
            } else if (choosed === 4) {
                thirdStep();
            }
        });
    
    });
}

function firstStep() {

    users.forEach(item => {

        item["man_small"] = document.createElement("div");
        item["man_small"].classList.add("man_small")
        item["man_small"].style.width = `${manWidth*0.4}px`;
        item["man_small"].style.height = `${manHeight*0.4}px`;
        item["man_small"].style.left = `${item["left"]}px`;
        item["man_small"].style.bottom = `${item["bottom"]}px`;
        map.append(item["man_small"]);
    
        item["man_medium"] = document.createElement("div");
        item["man_medium"].classList.add("man_medium")
        item["man_medium"].style.width = `${manWidth*0.7}px`;
        item["man_medium"].style.height = `${manHeight*0.7}px`;
        item["man_medium"].style.left = `${item["left"] + manWidth*0.4 + 1}px`;
        item["man_medium"].style.bottom = `${item["bottom"]}px`;
        map.append(item["man_medium"]);
    
        item["man_large"] = document.createElement("div");
        item["man_large"].classList.add("man_large")
        item["man_large"].style.width = `${manWidth}px`;
        item["man_large"].style.height = `${manHeight}px`;
        item["man_large"].style.left = `${item["left"] + manWidth*1.1 + 2}px`;
        item["man_large"].style.bottom = `${item["bottom"]}px`;
        map.append(item["man_large"]);
    
        item["small"] = document.createElement("div");
        item["small"].classList.add("small")
        item["small"].setAttribute("data-place", item.place);
        item["small"].style.left = `${item["left_s"]}px`;
        item["small"].style.bottom = `${item["bottom_s"]}px`;
        item["small"].style.display = "none";
        map.append(item["small"]);
    
        item["medium"] = document.createElement("div");
        item["medium"].classList.add("medium")
        item["medium"].setAttribute("data-place", item.place);
        item["medium"].style.left = `${item["left_m"]}px`;
        item["medium"].style.bottom = `${item["bottom_m"]}px`;
        item["medium"].style.display = "none";
        map.append(item["medium"]);
    
        item["large"] = document.createElement("div");
        item["large"].classList.add("large")
        item["large"].setAttribute("data-place", item.place);
        item["large"].style.left = `${item["left_l"]}px`;
        item["large"].style.bottom = `${item["bottom_l"]}px`;
        item["large"].style.display = "none";
        map.append(item["large"]);
    
        item["man_small"].addEventListener("click", (e) => {
            displayNone(item["man_small"], item["man_medium"], item["man_large"]);
            item["small"].style.display = "block";
            checkChoosed()
        })
    
        item["man_medium"].addEventListener("click", (e) => {
            displayNone(item["man_small"], item["man_medium"], item["man_large"]);
            item["small"].style.display = "block";
            item["medium"].style.display = "block";
            checkChoosed()
        })
    
        item["man_large"].addEventListener("click", (e) => {
            displayNone(item["man_small"], item["man_medium"], item["man_large"]);
            item["small"].style.display = "block";
            item["medium"].style.display = "block";
            item["large"].style.display = "block";
            checkChoosed()
        })
    
    });
    
    next.addEventListener("click", () => {
        secondStep();
    });
}

firstStep();
