            /*============
            Swiping card thingamajig
            ==============*/
            const SWIPE_THRESHOLD = 100;

            function attachDrag(foodCard) {
            let startX = 0, startY = 0, currentX = 0, currentY = 0, dragging = false;

            foodCard.addEventListener('pointerdown', (e) => {
                if (e.target.closest('.secondary-btn')) return;
                dragging = true;
                startX = e.clientX;
                startY = e.clientY;
                foodCard.classList.add('dragging');
                foodCard.setPointerCapture(e.pointerId);
            });

            foodCard.addEventListener('pointermove', (e) => {
                if (!dragging) return;
                currentX = e.clientX - startX;
                currentY = e.clientY - startY;
                const rotate = currentX / 12;
                foodCard.style.transform = 'translate(' + currentX + 'px,' + currentY + 'px) rotate(' + rotate + 'deg)';
                setStamps(currentX / SWIPE_THRESHOLD);
            });

            foodCard.addEventListener('pointerup', () => {
                if (!dragging) return;
                dragging = false;
                foodCard.classList.remove('dragging');

                if (currentX > SWIPE_THRESHOLD) {
                    finishSwipe(1);
                } else if (currentX < -SWIPE_THRESHOLD) {
                    finishSwipe(-1);
                } else {
                    foodCard.style.transform = '';
                    setStamps(0);
                }
                currentX = 0;
                currentY = 0;
            });
        }

            /* strength: -1 (pass) .. 0 .. 1 (yum) */
            function setStamps(strength) {
                const clamp = v => Math.max(0, Math.min(1, v));
                document.getElementById('stampYum').style.opacity = clamp(strength);
                document.getElementById('stampPass').style.opacity = clamp(-strength);
            }

            function finishSwipe(direction) {
                const foodCard = document.getElementById('foodCard');
                if (foodCard.classList.contains('fly-left') || foodCard.classList.contains('fly-right')) return;
                setStamps(direction);
                foodCard.classList.add(direction > 0 ? 'fly-right' : 'fly-left');

                foodCard.addEventListener('transitionend', function onEnd(e) {
                    if (e.target !== foodCard) return;
                    foodCard.removeEventListener('transitionend', onEnd);
                    setStamps(0);
                    if (direction > 0 && filteredFoods[currentFood]) {
                        const alreadySaved = savedFoods.some(saved => saved.name === filteredFoods[currentFood].name);
                        if (!alreadySaved) {
                            savedFoods.push(filteredFoods[currentFood]);
                            renderSavedRecipes();
                        }
                    }
                    if (filteredFoods.length > 0) {
                        currentFood = (currentFood + 1) % filteredFoods.length;
                    }
                    foodCard.classList.remove('fly-left', 'fly-right');
                    foodCard.style.transition = 'none';
                    foodCard.style.transform = '';
                    loadFood();
                    void foodCard.offsetWidth;
                    foodCard.style.transition = '';
                });
            }

            function programmaticSwipe(direction) {
                finishSwipe(direction);
            }
            /*==============
            SAVED RECIPES
            ================*/
            function emptyState(message){
                return `<div class="empty-saved"><img src="square-image.jpg" alt=""><p>${message}</p></div>`;
            }

            function renderSavedRecipes(){
                const list = document.getElementById("savedRecipesList");
                if (!list) return;

                if (savedFoods.length === 0){
                    list.innerHTML = emptyState("No matches yet. Swipe right on a recipe to save it here.");
                    return;
                }

                list.innerHTML = savedFoods.map((food, index) => `
                    <button type="button" class="saved-card" onclick="viewSavedRecipe(${index})">
                        <img src="${food.image}" class="saved-thumb" alt="">
                        <div class="saved-info">
                            <h4 class="saved-name">${food.name}</h4>
                            <span class="saved-meta">${food.calories}</span>
                        </div>
                    </button>
                `).join("");
            }

            function viewSavedRecipe(index){
                const food = savedFoods[index];
                if (!food) return;
                showDetails(food);
            }
            /*==============
                SEARCH
            ================*/
            function renderSearchResults(){
                const input = document.getElementById("searchInput");
                const list = document.getElementById("searchResultsList");
                if (!list || !input) return;
 
                const query = input.value.trim().toLowerCase();
 
                if (query === ""){
                    list.innerHTML = emptyState("Start typing to find a recipe by name or tag.");
                    return;
                }
 
                const results = foods
                    .map((food, index) => ({ food, index }))
                    .filter(({ food }) => {
                        if (!food.name) return false;
                        const nameMatch = food.name.toLowerCase().includes(query);
                        const tagMatch = Array.isArray(food.tags) &&
                            food.tags.some(tag => tag.toLowerCase().includes(query));
                        return nameMatch || tagMatch;
                    });
 
                if (results.length === 0){
                    list.innerHTML = emptyState(`No recipes found for "${input.value}".`);
                    return;
                }
 
                list.innerHTML = results.map(({ food, index }) => `
                    <button type="button" class="saved-card" onclick="viewSearchResult(${index})">
                        <img src="${food.image}" class="saved-thumb" alt="">
                        <div class="saved-info">
                            <h4 class="saved-name">${food.name}</h4>
                            <div class="tags">${food.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}</div>
                        </div>
                    </button>
                `).join("");
            }
 
            function viewSearchResult(index){
                const food = foods[index];
                if (!food) return;
                showDetails(food);
            }

            /*============
            FOOD DATABASE
            ==============*/
            const foods = [
                {
                    name: "Tomato Chicken and Brocolli Penne",
                    allergy: "Dairy",
                    diet: "None",
                    calories: "443 calories / serving",
                    serves: "6",
                    cookingtime: "25 min",
                    image: "https://digitalcontent.api.tesco.com/v2/media/realfood/f74963ea-84e0-47af-96bc-bb3bc7290d68/1400x919+SchoolHolidaysSorted+ChickenBroccoliAlfredo.jpeg",
                    tags: [
                        "Creamy",
                        "Low Fat",
                        "Quick"
                    ],
                    nutrition: [
                        "Carbohydrate 44.2g",
                        "Protein 41.2g",
                        "Fiber 7.8g"
                    ],
                    ingredients: [
                        "300g penne pasta",
                        "375g broccoli",
                        "1 tbsp olive oil",
                        "1 onion, finely chopped​",
                        "3 cloves of garlic, finely chopped",
                        "650g chicken breast, diced",
                        "400g tin of cherry tomatoes",
                        "1 tsp oregano",
                        "1 chicken stock pot",
                        "2 tbsp cream cheese",
                        "Parmesan cheese"
                    ],
                    steps: [
                        "Boil pasta in a large pan of salted water for around 7 mins",
                        "Add the broccoli for the final 3-4 minutes until both are cooked through.",
                        "Drain and set to one side, reserving about 100ml of the pasta water",
                        "Meanwhile, add the olive oil to a frying pan and place on the hob over a medium-high heat.",
                        "Add the onion and fry it along with the garlic, stirring continuously for 5 mins until the onion turns soft",
                        "Add the diced chicken breast to the pan and stir until the chicken browns",
                        "Add cherry tomatoes to the pan, along with the oregano and the chicken stock pot",
                        "Stir until the chicken stock pot has dissolved",
                        "Add the reserved pasta water and simmer for another 10 mins",
                        "Add the cream cheese, pasta and broccoli to the pan and mix well",
                        "Serve with Parmesan cheese"
                    ]
                },
                {
                    name: "Dairy-free Chicken Alfredo",
                    allergy: "Nuts",
                    diet: "None",
                    calories: "515 calories / serving",
                    serves: "4",
                    cookingtime: "25 min",
                    image: "https://originalsin.com.sg/wp-content/uploads/2025/05/chicken-alfredo-recipe-1746274057.jpg",
                    tags: [
                        "Dairy-free",
                        "Low-Sugar",
                        "Quick",
                    ],
                    nutrition: [
                        "Carbohydrate 42.8g",
                        "Protein 38g",
                        "Fat 22.1g",
                    ],
                    ingredients: [
                        "230g fettucine",
                        "88g raw cashews",
                        "240ml chicken broth",
                        "60 ml full-fat coconut milk",
                        "2 garlic cloves crushed",
                        "1 pound cubed chicken breast",
                        "15ml cornstarch",
                        "Salt",
                        "Black pepper",
                        "15ml olive oil",
                        "Water",
                    ],
                    steps: [
                        "Cook the pasta for 7-13 minutes",
                        "Meanwhile, place cashews in a food processor and whiz into a powder",
                        "Add cashew powder to a blender with broth, coconut milk, and garlic, puree until smooth",
                        "Put the chicken in a medium bowl and stir in the starch or flour, salt, and black pepper",
                        "Heat oil in a large skillet over medium heat",
                        "Add the chicken and cook for about 5 minutes, searing on all sides",
                        "Pour cashew mixture into the skillet",
                        "When it begins to bubble, reduce the heat to medium-low and continue cooking while whisking, until it reduces to your desired thickness",
                        "Season sauce with salt and black pepper to taste",
                        "Divide the cooked pasta between four plates, top with the chicken and sauce and garnish with fresh herbs, if desired."
                    ]
                },
                {
                    name: "Salsa and Avocado Tofu Wraps",
                    allergy: ["Soy", "Gluten"],
                    diet: "Vegetarian",
                    calories: "400 calories / serving",
                    serves: "4",
                    cookingtime: "40 min",
                    image: "https://digitalcontent.api.tesco.com/v2/media/realfood/ff6978a6-96ee-45b3-8ed1-b96b56974515/Grilled+tofu+wraps+%28LGH%29.jpeg",
                    tags: [
                        "Vegetarian",
                        "Healthy",
                        "Low-Sugar"
                    ],
                    nutrition: [
                        "Carbohydrate 43.3g",
                        "Protein 6.8g",
                        "Fibre 6.8g"
                    ],
                    ingredients: [
                        "400g firm tofu",
                        "3 tbsp light soy sauce",
                        "4 flour tortillas",
                        "200g (7oz) tomato salsa",
                        "2 avocados",
                        "1 lemon",
                    ],
                    steps: [
                        "Preheat the barbecue then slice the tofuwidth ways into 8 pieces",
                        "Lay the tofu pieces on a baking tray, drizzle over soysauce and allow to marinate for 20-30 minutes",
                        "Put the tofu in a single layer on the barbecue and cook for 15-20 minutes, turning occasionally until golden and a crust forms on the outside",
                        "Once the tofu is ready, lay out the tortillas and top with a spoonful of salsa, the avocado slices and then two tofu pieces per wrap",
                        "Finish with a squeeze of lemon, wrap and serve",
                    ]
                },
                {
                    name: "Butternut Squash Mac and Cheese",
                    allergy: ["Gluten", "Dairy"],
                    diet: "None",
                    calories: "589 calories / serving",
                    serves: "6",
                    cookingtime: "1 hr 20 min",
                    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.07lnTz5v3iKQxxs4p2SITAHaHa%3Fpid%3DApi&f=1&ipt=b395241e4e5f464dde1d61c73aa0ae3e359b8da9e79412e39cfbaddb4cacfdce&ipo=images",
                    tags: [
                        "Healthy",
                        "Vegetarian",
                        "Creamy"
                    ],
                    nutrition: [
                        "Carbohydrates 83g", 
                        "Protein 21g",
                        "Fiber 5g",
                    ],
                    ingredients: [
                        "750g butternut squash",
                        "1 tsp salt",
                        "2 tsp oil",
                        "1 medium onion finely chopped",
                        "3 garlic cloves crushed",
                        "3 tbsp butter",
                        "2 tbsp flour",
                        "1 cup milk",
                        "120ml heavy cream",
                        "2 cups shredded/grated cheese Cheddar, gruyere and parmesan",
                        "A pinch of ground nutmeg",
                        "Salt and black pepper",
                        "500g macaroni",
                    ],
                    steps: [
                        "Preheat the oven to 200°C",
                        "Cut the butternut squash in half",
                        "Place on a baking sheet, cut-side down, then drizzle with the oil and season with salt",
                        "Roast for 45 minutes",
                        "Remove from the oven, scoop out the flesh and discard seeds",
                        "Blend the flesh until smooth",
                        "Heat a large skillet or frying pan over medium heat then melt the butter",
                        "Add the onion and garlic and sauté until softened",
                        "Stir in the flour then slowly whisk the milk and the cream until smooth.",
                        "Season with the nutmeg and allow to simmer gently for 5 minutes",
                        "Stir in the cheese and butternut squash puree and season with salt and pepper",
                        "Stir together the breadcrumbs and seasonings with the oil",
                        "Cook the pasta in a large pot of salted boiling water for 8 minutes, the pasta will continue baking in the oven",
                        "Reserve 1 cup of pasta cooking water and drain the pasta",
                        "Stir the pasta through the sauce and add a splash of pasta water to loosen the sauce",
                        "Transfer to a baking dish then finish with the breadcrumb topping",
                        "Bake at 180°C for 15-20 minutes until golden brown and bubbling",
                        "Remove from the oven and allow to rest for 5 minutes before serving"
                    ]
                },
                {
                    name: "Mushroom Burger Patties",
                    allergy: ["Dairy", "Gluten", "Eggs"],
                    diet: "Vegetarian",
                    calories: "255 calories / serving",
                    serves: "6",
                    cookingtime: "45 mins",
                    image: "https://www.allrecipes.com/thmb/0Ro8PbArf3PpaKgjRX1Vrzlp320=/0x512/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/233999-mushroom-veggie-burger-VAT-Beauty-4x3-52ccbec6d099434eb10b83bd2aa5687d.jpg",
                    tags: [
                        "Vegetarian",
                        "Low Sugar",
                        "Alternative Friendly"
                    ],
                    nutrition: [
                        "Carbohydrates 23g",
                        "Fiber 3g",
                        "Protein 11g"
                    ],
                    ingredients: [
                        "4 tablespoons olive oil, divided",
                        "3 (8 ounce) packages sliced white mushrooms",
                        "½ medium onion, finely chopped",
                        "4 cloves garlic, minced",
                        "1 teaspoon salt",
                        "½ teaspoon black pepper",
                        "½ teaspoon dried oregano",
                        "¾ cup dry bread crumbs",
                        "⅔ cup rolled oats",
                        "½ cup freshly shredded Parmigiano-Reggiano cheese",
                        "2 large eggs, beaten",],
                    steps: [
                        "Heat 2 tablespoons oil in a large skillet over medium heat",
                        "Add mushrooms, onion, garlic, salt, pepper, and oregano; cook and stir until mushrooms have released their juices and the liquid has evaporated for 10 minutes then remove from the heat",
                        "Transfer mushrooms to a cutting board and clean the skillet",
                        "Chop mushrooms into small chunks, then transfer to a large bowl",
                        "Mix in bread crumbs and oats, and season with salt and pepper as needed",
                        "Stir in Parmigiano-Reggiano cheese, then eggs; let stand until bread crumbs have absorbed any excess liquid",
                        "Use moist hands to form mixture, 1/4 cup at a time, into patties",
                        "Heat remaining 2 tablespoons oil in the skillet over medium heat to pan-fry patties in the hot skillet until golden brown and cooked through, 2 ½ to 3 minutes per side"
                    ]
                },
                {
                    name: "Lion's Mane Steak",
                    allergy: "",
                    diet: "Vegan",
                    calories: "54 calories / serving",
                    serves: "2-4",
                    cookingtime: "8 min",
                    image: "https://www.babaganosh.org/wp-content/uploads/2023/04/lions-mane-steak-8.jpg.webp",
                    tags: ["Vegan", "Low Calorie", "Alternative Friendly"],
                    nutrition: ["Carbohydrates 7g", "Protein 2g", "Fiber 2g"],
                    ingredients: [
                        "1 large lion's mane mushroom",
                        "3-4 teaspoons steak seasoning to taste",
                        "Olive oil",
                        "optional: salted butter"],
                    steps: [
                        "Place the mushroom on the cutting board with the stem-side down (like a cauliflower). Slice down the middle, then slice 1.5-inch thick 'steaks' from each half",
                        "If yours is wide and flat, you might need to leave it as-is and press it down into a flat steak as it cooks",
                        "Spray or brush the tops of the mushroom steaks with olive oil",
                        "Season the tops of the mushroom steaks with steak seasoning",
                        "Preheat a large skillet over medium heat then lightly spray or brush the pan with olive oil, and place the steaks seasoned side down",
                        "Cover and cook over medium heat for 2-3 minutes, or until the mushroom softens and the bottom is becoming nice and browned/blackened.",
                        "Uncover the pan, spray or brush the other side of the mushroom steak with oil and season with steak seasoning",
                        "Flip the steaks and cook uncovered for another 2-3 minutes, or until the mushroom is cooked to your liking",
                        "Optional: Add a thin slice of salted butter"]
                },
                {
                    name: "",
                    allergy: "",
                    diet: "",
                    calories: "",
                    serves: "",
                    cookingtime: "",
                    image: "",
                    tags: [],
                    nutrition: [],
                    ingredients: [],
                    steps: []
                },
            ];

            let currentFood = 0;
            let currentDetailFood = null;
            let savedFoods = [];
            let userPreferences = { name: "", goal: "", diet: "None", allergies: [] };
            let filteredFoods = [];
            /*==============
                DIET FILTER
            ================*/
            function isDietCompatible(userDiet, foodDiet){
                if (!userDiet || userDiet === "None") return true;

                const foodDiets = Array.isArray(foodDiet) ? foodDiet : [foodDiet];

                if (userDiet === "Vegan"){
                    return foodDiets.includes("Vegan");
                }
                if (userDiet === "Vegetarian"){
                    return foodDiets.includes("Vegetarian") || foodDiets.includes("Vegan");
                }
                return true;
            }
            /*==============
                ALLERGY FILTER
            ================*/
            function isAllergySafe(userAllergies, foodAllergy){
                if (!userAllergies || userAllergies.length === 0) return true;

                const foodAllergies = Array.isArray(foodAllergy) ? foodAllergy : [foodAllergy];
                return !userAllergies.some(allergen => foodAllergies.includes(allergen));
            }

            function applyDietFilter(){
                filteredFoods = foods.filter(food =>
                    food.name &&
                    isDietCompatible(userPreferences.diet, food.diet) &&
                    isAllergySafe(userPreferences.allergies, food.allergy)
                );
                currentFood = 0;
            }
            /*==============
                PREMIUM
            ================*/
            function planSelected(el){
                document.querySelectorAll(".plans")
                .forEach(card => card.classList.remove("selected"));
                el.classList.add("selected");
            }
            /*==============
               FOOD CARD
            ================*/
            function loadFood(){
                if (filteredFoods.length === 0){
                    document.getElementById("foodImage").src = "";
                    document.getElementById("foodCalories").textContent = "";
                    document.getElementById("foodName").textContent = "No recipes match your diet yet";
                    document.getElementById("foodTags").innerHTML = "";
                    return;
                }
                const food = filteredFoods[currentFood];
                document.getElementById("foodImage").src = food.image;
                document.getElementById("foodCalories").textContent= food.calories;
                document.getElementById("foodName").textContent = food.name;
                document.getElementById("foodTags").innerHTML = food.tags
                    .map(tag =>`<span class="tag">${tag}</span>`)
                    .join("");
            }

            /*==============
               FOOD DETAILS
            ================*/
            function showDetails(food){
                const targetFood = food || filteredFoods[currentFood];
                if (!targetFood) return;
                currentDetailFood = targetFood;
                if (currentScreen !== "details") detailReturnScreen = currentScreen;
                document.getElementById("detailImage").src = targetFood.image;
                document.getElementById("detailName").textContent = targetFood.name;
                document.getElementById("detailCalories").textContent = targetFood.calories;
                document.getElementById("detailServes").textContent = targetFood.serves;
                document.getElementById("detailCookingtime").textContent = targetFood.cookingtime;
                document.getElementById("nutrition").innerHTML = targetFood.nutrition
                .map(item => {
                    const m = item.match(/^(.*?)\s*([\d.]+\s?g)$/);
                    return m
                        ? `<div class="macro"><strong>${m[2]}</strong><span>${m[1]}</span></div>`
                        : `<div class="macro"><span>${item}</span></div>`;
                })
                .join("");
                document.getElementById("ingredients").innerHTML = targetFood.ingredients
                .map (item => `<label class="ingredient"><input type="checkbox"><span>${item}</span></label>`)
                .join("");
                document.getElementById("steps").innerHTML = targetFood.steps
                .map((step, index) => `<div class="step">
                    <div class="step-number">${index +1}</div>
                    <p>${step}</p></div>`)
                    .join("");
                showScreen("details");
                document.getElementById("details").scrollTop = 0;
            }

            function closeDetails(){
                showScreen(detailReturnScreen);
            }
            /*=================
                    MAIN
            ===================*/
            const NAV_SCREENS = ["homepage", "search-page", "recipes", "subscription", "credits"];
            let currentScreen = "welcome";
            let detailReturnScreen = "homepage";

            function showScreen(screenName){
                document.querySelectorAll(".screen").forEach(screen => {
                screen.classList.remove("active");
                });
                document.getElementById(screenName).classList.add("active");
                currentScreen = screenName;
                document.getElementById("app").classList.toggle("has-nav", NAV_SCREENS.includes(screenName));
                document.querySelectorAll(".nav-item").forEach(item => {
                    item.classList.toggle("active", item.dataset.screen === screenName);
                });
            }

            document.querySelectorAll(".nav-item").forEach(item => {
                item.addEventListener("click", () => showScreen(item.dataset.screen));
            });
            /*=================
                ONBOARDING
            ===================*/
            function StartAPP()
                {showScreen("guest-form")};
            /*HOME PAGE*/
            function onboardingFinish(){
                const nameInput = document.getElementById("name");
                const goalSelect = document.getElementById("goal");
                const dietSelect = document.getElementById("diet");
                const allergy1Select = document.getElementById("allergy1");
                const allergy2Select = document.getElementById("allergy2");

                userPreferences.name = nameInput ? nameInput.value : "";
                userPreferences.goal = goalSelect ? goalSelect.value : "";
                userPreferences.diet = dietSelect ? dietSelect.value : "None";

                const pickedAllergies = [allergy1Select, allergy2Select]
                    .map(select => select ? select.value : "None")
                    .filter(value => value && value !== "None");
                userPreferences.allergies = [...new Set(pickedAllergies)];

                const greeting = document.getElementById("greeting");
                const name = userPreferences.name.trim();
                greeting.textContent = "";
                greeting.append("Hi, ");
                const strong = document.createElement("strong");
                strong.textContent = name || "there";
                greeting.append(strong);

                applyDietFilter();
                showScreen("homepage");
                loadFood();
            };

            /*=================
               INITIAL LOAD
            ===================*/
            attachDrag(document.getElementById('foodCard'));
            applyDietFilter();
            loadFood();
            renderSavedRecipes();