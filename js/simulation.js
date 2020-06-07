var global = {};

function clearState() {
    global = {
        trees: [],
        years: [{
            oaks: {
                quantity: 0,
                diseased: 0,
                harvested: 0
            },
            pines: {
                quantity: 0,
                diseased: 0,
                harvested: 0
            },
            maples: {
                quantity: 0,
                diseased: 0,
                harvested: 0
            },
            nests: 0,
            trucks: 0
        
        }]
    };
}

function runSimulation() {

    clearState();

    global.amountOfYears = $('#amountOfYears').val();
    global.forestSize = $('#forestSize').val();
    global.proportionOfOakTrees = $('#proportionOfOakTrees').val();
    global.oaksSize = Math.round(global.forestSize * global.proportionOfOakTrees);
    global.years[0].oaks.quantity = global.oaksSize;
    global.proportionOfPineTrees = $('#proportionOfPineTrees').val();
    global.pineSize = Math.round(global.forestSize * global.proportionOfPineTrees);
    global.years[0].pines.quantity = global.pineSize;
    global.proportionOfDoveInTrees = $('#proportionOfDoveInTrees').val();
    global.doveSize = Math.round(1 / global.proportionOfDoveInTrees);

    if (global.oaksSize + global.pineSize > global.forestSize) {
        displayMessage(
            'Error: number of Oaks and Pines is more than total number of trees. Change proportions please.',
            true
        );
    } else {

        generateForest();

        for (var i = 0; i < global.amountOfYears - 1; i++) {
            simulateOneYear(i);
        }

        var parametersMsg = 'Simlation parameters:<br/><ul>' + 
        '<li>number of all trees is ' + global.forestSize + '</li>' +
        '<li>number of Oak trees is ' + global.oaksSize + '</li>' +
        '<li>number of Pine trees is ' + global.pineSize + '</li>' +
        '<li>every ' + global.doveSize + ' trees there will be a dove nests</li>' +
        '<li>simulation will run for ' + global.amountOfYears + ' years</li>' + 
        '</ul>';

        var report = '<br/><br/>Report:<br/><table class="table">' +
            '<tr><th>Year</th><th>Oaks (start year)</th><th>Oaks (deseased)</th><th>Oaks (harvested)</th><th>Pines (start year)</th><th>Pines (deseased)</th><th>Pines (harvested)</th><th>Maples (start year)</th><th>Maples (deseased)</th><th>Maples (harvested)</th><th>Nests (unharvestable)</th><th>Trucks </th></tr>';
        for (var i = 0; i < global.years.length; i++) {
            var yearStats = global.years[i];
            report += '<tr><td>' + (i + 1) + '</td><td>' + yearStats.oaks.quantity + '</td><td>' + yearStats.oaks.diseased + '</td><td>' + yearStats.oaks.harvested + '</td>' +
                                                '<td>' + yearStats.pines.quantity + '</td><td>' + yearStats.pines.diseased + '</td><td>' + yearStats.pines.harvested + '</td>' + 
                                                '<td>' + yearStats.maples.quantity + '</td><td>' + yearStats.maples.diseased + '</td><td>' + yearStats.maples.harvested + '</td>' +
                                                '<td>' + yearStats.nests + '</td>' + '<td>' + yearStats.trucks + '</td>' +
                                                '</tr>';
        }
        report += '</table>';
        
        displayMessage(parametersMsg + report, false);
    }


    $("#resultsDivContainer").show();
    return false;
}

function generateForest() {

    for (var i = 0; i < global.years[0].pines.quantity; i++) {
        global.trees.push(treeObject('pine', Math.round(Math.random() * 100)));
    }
    for (var i = 0; i < global.years[0].oaks.quantity; i++) {
        global.trees.push(treeObject('oak', Math.round(Math.random() * 100)));
    } 

}

function treeObject(kind, age, diseased = false) {
    return {
        kind: kind,
        age: age,
        diseased: diseased,
        harvested: false
    }
}

function calculateTrucks(numberOfTrees, oneTruckLoad){
    return numberOfTrees % oneTruckLoad != 0? Math.floor(numberOfTrees / oneTruckLoad) + 1 : Math.floor(numberOfTrees / oneTruckLoad);

}

function isValidTree(tree) {
    return !tree.diseased && !tree.harvested;
}

function simulateOneYear(year) {

    // counts trees that are harvestable

    var pinesHarvested = 0;
    var oaksHarvested = 0;
    var couldNotHarvestDueToNest = 0;

    var healthyCount = 0;
    for (var i = 0; i < global.trees.length; i++) {
        var tree = global.trees[i];
        if (isValidTree(tree)) {
            if (healthyCount % global.doveSize == 0) {
                couldNotHarvestDueToNest++;
            } else {
                if (tree.kind == 'pine' && tree.age > 25 && tree.age < 70) {
                    pinesHarvested++;
                    tree.harvested = true;
                } else if (tree.kind == 'oak' && tree.age > 90 && tree.age < 150) {
                    oaksHarvested++;
                    tree.harvested = true;
                }
            }
            healthyCount++;
        }
    }

    // run desease probability

    var pineDiseased = 0;
    var oakDiseased = 0;
    var maplesDiseased = 0;

    for (var i = 0; i < global.trees.length; i++) {
        var tree = global.trees[i];
        if (isValidTree(tree)) {
            var deseaseProbability = tree.kind == 'pine' ? 0.05 : (tree.kind == 'oak' ? 0.03 : 0.04);
            var isDeseased = Math.random() < deseaseProbability;
            tree.diseased = isDeseased;
            if (isDeseased) {
                if (tree.kind == 'pine') {
                    pineDiseased++;
                } else if (tree.kind == 'oak') {
                    oakDiseased++;
                } else {
                    maplesDiseased++;
                }
            }
        }
    }

    // update age of trees

    for (var i = 0; i < global.trees.length; i++) {
        var tree = global.trees[i];
        tree.age++;
    }

    // plant new trees to compensate for deseased

    var replanted = 1;

    for (var i = 0; i < pineDiseased + pinesHarvested; i++) {
        if (replanted % 3 == 0) {
            global.trees.push(treeObject('maple', 1));   
            
        } else {
            global.trees.push(treeObject('pine', 1));
            
        }
        replanted++;
    }
    for (var i = 0; i < oakDiseased + oaksHarvested; i++) {
        if (replanted % 3 == 0) {
            global.trees.push(treeObject('maple', 1));   
            
        } else {
            global.trees.push(treeObject('oak', 1));
            
        }
        replanted++;
    }
    for (var i = 0; i < maplesDiseased; i++) {
        var replantProbability = Math.random();
        if (replantProbability < 0.5) {
            global.trees.push(treeObject('oak', 1));
        } else {
           global.trees.push(treeObject('pine', 1)); 
        }

    }


    // update stats for current year

    global.years[year].pines.diseased = pineDiseased;
    global.years[year].oaks.diseased = oakDiseased;
    global.years[year].maples.diseased = maplesDiseased;
    global.years[year].pines.harvested = pinesHarvested;
    global.years[year].oaks.harvested = oaksHarvested;
    global.years[year].nests = couldNotHarvestDueToNest;
    global.years[year].trucks = calculateTrucks(pinesHarvested, 35) + calculateTrucks(oaksHarvested, 15);



    // set defaults for next year

    var yearTotalPines = 0;
    var yearTotalOaks = 0;
    var yearTotalMaples = 0;

    for (var i = 0; i < global.trees.length; i++) {
        var tree = global.trees[i];
        if (isValidTree(tree)) {
            if (tree.kind == 'pine') {
                yearTotalPines++;
            } else if (tree.kind == 'oak') {
                yearTotalOaks++;
            } else {
                yearTotalMaples++;
            }
        }
    }


    global.years.push({
        oaks: {
            quantity: yearTotalOaks,
            diseased: 0,
            harvested: 0
        },
        pines: {
            quantity: yearTotalPines,
            diseased: 0,
            harvested: 0
        },
        maples: {
            quantity: yearTotalMaples,
            diseased: 0,
            harvested: 0
        },
        nests: 0,
        trucks: 0
    });
}

function displayMessage(message, error) {
    if (error) {
        $('#resultsDivError').html(message).show();
        $('#resultsDivSuccess').hide();
    } else {
        $('#resultsDivSuccess').html(message).show();
        $('#resultsDivError').hide();
    }

}
