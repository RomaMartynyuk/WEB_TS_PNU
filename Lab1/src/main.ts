function triangle(value1: number = 0, type1: string = "", value2: number = 0, type2: string = ""): string {

    let types: string[] = ["leg", "hypotenuse", "adjacent angle", "opposite angle", "angle"];

    if(type1 === "" || type2 === ""){
        console.log("error with types");
        return "failed";
    }
    if(typeof value1 != 'number' || typeof value2 != 'number'){
        return "error with value";
    }

    if (!types.includes(type1) || !types.includes(type2)) {
        console.log("error with types");
        return "failed";
    }

    if(type1 === type2 && type1 != "leg"){
        console.log("error with type compare");
        return "failed";
    }

    if((type1 === "angle" && type2 != "hypotenuse")||(type2 === "angle" && type1 != "hypotenuse")){
        console.log("error with type compare");
        return "failed";
    }

    if((type1 === "opposite angle" && type2 === "adjacent angle")||(type2 === "opposite angle" && type1 === "adjacent angle")){
        console.log("error with type compare");
        return "failed";
    }

    if((type1 === "adjacent angle" && type2 === "hypotenuse")||
    (type2 === "adjacent angle" && type1 === "hypotenuse")||
    (type1 === "opposite angle" && type2 === "hypotenuse")||
    (type2 === "opposite angle" && type1 === "hypotenuse")){
        console.log("error with type compare");
        return "failed";
    }

    if (value1 <= 0 || value2 <= 0 ) {
        console.log("error with values");
        return "failed";
    }

    let hypotenuse: number = 0, leg: number = 0, otherLeg: number = 0, alpha: number = 0, beta: number = 0;
    
    if (type1 === "leg" && type2 === "leg"){
        leg = Math.min(value1, value2);
        otherLeg = Math.max(value1, value2);
        hypotenuse = Math.sqrt(leg * leg + otherLeg * otherLeg);
        beta = Math.atan(leg / otherLeg) * (180 / Math.PI);
        alpha = 90 - beta;
    }
    else if (type1 === "leg" || type2 === "leg"){
        if (type1 === "hypotenuse" || type2 === "hypotenuse"){
            leg = (type1 === "leg") ? value1 : value2;
            hypotenuse = (type1 === "hypotenuse") ? value1 : value2;
            if(hypotenuse < leg){
                console.log("Катет не може бути більшим за гіпотенузу.");
                return "failed";
            }
            else{
                otherLeg = Math.sqrt(hypotenuse * hypotenuse - leg * leg);
                beta = Math.asin(leg / hypotenuse) * (180 / Math.PI);
                alpha = 90 - beta;
            }
        }
        if (type1 === "opposite angle" || type2 === "opposite angle"){
            leg = (type1 === "leg") ? value1 : value2;
            beta = (type1 === "opposite angle") ? value1 : value2;
            hypotenuse = leg / Math.sin(beta * (Math.PI / 180));
            otherLeg = Math.sqrt(hypotenuse * hypotenuse - leg * leg);
            alpha = 90 - beta;
        }
        if (type1 === "adjacent angle" || type2 === "adjacent angle"){
            leg = (type1 === "leg") ? value1 : value2;
            alpha = (type1 === "adjacent angle") ? value1 : value2;
            otherLeg = leg * Math.tan(alpha * (Math.PI / 180));
            hypotenuse = leg / Math.cos(alpha * (Math.PI / 180));
            beta = 90 - alpha;
        }
    }
    else if ((type1 === "hypotenuse" && type2 === "angle") || (type1 === "angle" && type2 === "hypotenuse")) {
        hypotenuse = (type1 === "hypotenuse") ? value1 : value2;
        alpha = (type1 === "angle") ? value1 : value2;
        leg = hypotenuse * Math.cos(alpha * (Math.PI / 180));
        otherLeg = hypotenuse * Math.sin(alpha * (Math.PI / 180));
        beta = 90 - alpha;
    }  
    
    if(beta > 90 || alpha > 90){
        console.log("Angle more than 90");
        return "failed";
    }
    
    if(beta == 90 || alpha == 90){
        console.log("Angle == 90... it's problem");
        return "failed";
    }

    console.log(`a = ${leg}\nb = ${otherLeg}\nc = ${hypotenuse}\nalpha = ${alpha}°\nbeta = ${beta}°`);
    return "success";
}