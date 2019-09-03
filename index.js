window.onload = ()=>{
    const screen = document.querySelector(".screen");
    const reset = document.querySelector("#reset");
    const randomBtn = document.querySelector("#random");
    const blackBtn = document.querySelector("#blackBtn");
    const eight = document.querySelector(".eight");
    const sixteen = document.querySelector(".sixteen");
    const thirty_two = document.querySelector(".thirty_two");
    let num = 8;
    let black = true;
    let div;
    let tile;

    for (let i = 0; i < (num*num); i++){
        screen.appendChild(document.createElement('div'));
    }

    screen.style.display = 'grid';
    screen.style.gridTemplateRows = `repeat(${num}, 1fr)`;
    screen.style.gridTemplateColumns = `repeat(${num}, 1fr)`;
    screen.style.gridGap = ".2em";

    div = screen.childNodes;

    for (let i = 1; i < div.length; i++){
        div[i].classList.add(`tile`);
    }

    tile = document.querySelectorAll(".tile");

    for(let i = 0; i < tile.length; i++){
        tile[i].addEventListener('mouseenter', (e)=>{makeBlack(e)})
    }

    function makeTiles(){
        div = screen.childNodes;

        for (let i = 1; i < div.length; i++){
            div[i].classList.add(`tile`);
        }

        tile = document.querySelectorAll(".tile");

        for(let i = 0; i < tile.length; i++){
            tile[i].addEventListener('mouseenter', (e)=>{makeBlack(e)})
        }
    }

    

    blackBtn.addEventListener('click', ()=>{
        black = true;
    })

    function makeBlack(e){
        if(black){
            e.target.style.backgroundColor = 'black';
        }
    }

    reset.addEventListener('click', resetCSS);

    function resetCSS(){
        black = true;
        for(let i = 0; i < tile.length; i++){
            tile[i].style.backgroundColor = 'rgb(223, 223, 223)';
        }
    }

    randomBtn.addEventListener('click', randomColors);

    function randomColors(){
        if(black){
            black = false;
        }
        for(let i = 0; i < tile.length; i++){
            tile[i].addEventListener('mouseenter', (e)=>{
                makeRandom(e);
            })
        }
    }
    function makeRandom(e){
        let r = Math.floor(Math.random()*256);
        let g = Math.floor(Math.random()*256);
        let b = Math.floor(Math.random()*256);
        if(!black){
            e.target.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        }
    }

    eight.addEventListener('click',()=>{
        black = true;
        num = 8;
        while (screen.firstChild){
            screen.removeChild(screen.firstChild);
        }
        for (let i = 0; i < (num*num); i++){
            screen.appendChild(document.createElement('div'));
        }
        screen.style.gridTemplateRows = `repeat(${num}, 1fr)`;
        screen.style.gridTemplateColumns = `repeat(${num}, 1fr)`;
        makeTiles();
    });

    sixteen.addEventListener('click',()=>{
        black = true;
        num = 16;
        while (screen.firstChild){
            screen.removeChild(screen.firstChild);
        }
        for (let i = 0; i < (num*num); i++){
            screen.appendChild(document.createElement('div'));
        }
        screen.style.gridTemplateRows = `repeat(${num}, 1fr)`;
        screen.style.gridTemplateColumns = `repeat(${num}, 1fr)`;
        makeTiles();
    });

    thirty_two.addEventListener('click',()=>{
        black = true;
        num = 32;
        while (screen.firstChild){
            screen.removeChild(screen.firstChild);
        }
        for (let i = 0; i < (num*num); i++){
            screen.appendChild(document.createElement('div'));
        }
        screen.style.gridTemplateRows = `repeat(${num}, 1fr)`;
        screen.style.gridTemplateColumns = `repeat(${num}, 1fr)`;
        makeTiles();
    });
}