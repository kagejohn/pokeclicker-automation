/**
 * @class AutomationShop provides functionality to automatically buy common items
 */
class AutomationShop
{
    static Settings = {
                          FeatureEnabled: "Shop-Enabled"
                      };

    /**
     * @brief Builds the menu, and retores previous running state if needed
     *
     * @param initStep: The current automation init step
     */
    static initialize(initStep)
    {
        if (initStep === Automation.InitSteps.BuildMenu)
        {
            // Disable AutoBuy by default
            Automation.Utils.LocalStorage.setDefaultValue(this.Settings.FeatureEnabled, false);

            this.__internal__buildMenu();
        }
        else if (initStep === Automation.InitSteps.Finalize)
        {
            // Restore previous session state
            this.__internal__toggleAutoBuy();
        }
    }

    /*********************************************************************\
    |***    Internal members, should never be used by other classes    ***|
    \*********************************************************************/

    static __internal__shoppingContainer = null;
    static __internal__shopLoop = null;

    static __internal__buildMenu()
    {
        // Add the related buttons to the automation menu
        this.__internal__shoppingContainer = document.createElement("div");
        Automation.Menu.AutomationButtonsDiv.appendChild(this.__internal__shoppingContainer);

        Automation.Menu.addSeparator(this.__internal__shoppingContainer);

        // Only display the menu when the Poké Mart is unlocked
        if (!TownList["Cinnabar Island"].isUnlocked())
        {
            this.__internal__shoppingContainer.hidden = true;
            this.__internal__setShoppingUnlockWatcher();
        }

        let autoShopTooltip = "Automatically buy the configured items (see advanced settings)"
                            + Automation.Menu.TooltipSeparator
                            + "⚠️ This can be cost-heavy";
        let autoShopButton =
            Automation.Menu.addAutomationButton("Auto Shop", this.Settings.FeatureEnabled, autoShopTooltip, this.__internal__shoppingContainer);
        autoShopButton.addEventListener("click", this.__internal__toggleAutoBuy.bind(this), false);

        // Build advanced settings panel
        let shoppingSettingPanel = Automation.Menu.addSettingPanel(autoShopButton.parentElement.parentElement);

        let titleDiv = Automation.Menu.createTitleElement("Auto shop advanced settings");
        titleDiv.style.marginBottom = "10px";
        shoppingSettingPanel.appendChild(titleDiv);

        // Add the min pokedolar limit input
        let minPokedollarsInputContainer = document.createElement("div");
        minPokedollarsInputContainer.style.textAlign = "left";

        let minPokedollarsText = document.createTextNode("Stop buying if the player has less than");
        minPokedollarsInputContainer.appendChild(minPokedollarsText);

        let minPokedollarsInputElem = Automation.Menu.createTextInputElement(10, "[0-9]");
        minPokedollarsInputElem.innerHTML = "10000"; // TODO get the saved setting value
        minPokedollarsInputContainer.appendChild(minPokedollarsInputElem);

        let minPokedollarsImage = document.createElement("img");
        minPokedollarsImage.src = "assets/images/currency/money.svg";
        minPokedollarsImage.style.height = "25px";
        minPokedollarsInputContainer.appendChild(minPokedollarsImage);

        shoppingSettingPanel.appendChild(minPokedollarsInputContainer);
        shoppingSettingPanel.appendChild(document.createElement("br"));

        this.__internal__buildShopItemList(shoppingSettingPanel);
    }

    /**
     * @brief Watches for the in-game functionality to be unlocked.
     *        Once unlocked, the menu will be displayed to the user
     */
    static __internal__setShoppingUnlockWatcher()
    {
        let watcher = setInterval(function()
        {
            if (TownList["Cinnabar Island"].isUnlocked())
            {
                clearInterval(watcher);
                this.__internal__shoppingContainer.hidden = false;
                this.__internal__toggleAutoBuy();
            }
        }.bind(this), 10000); // Check every 10 seconds
    }

    static __internal__toggleAutoBuy(enable)
    {
        if (!TownList["Cinnabar Island"].isUnlocked())
        {
            return;
        }

        if ((enable !== true) && (enable !== false))
        {
            enable = (Automation.Utils.LocalStorage.getValue(this.Settings.FeatureEnabled) === "true");
        }

        if (enable)
        {
            if (this.__internal__shopLoop === null)
            {
                this.__internal__shopLoop = setInterval(this.__internal__shop.bind(this), 1000); // Runs every 1s
            }
        }
        else
        {
            clearInterval(this.__internal__shopLoop);
            this.__internal__shopLoop = null;
        }
    }

    /**
     * @brief Adds the shop item list and adds it to the advanced settings
     *
     * @param {Element} parentDiv: The div to add the list to
     */
    static __internal__buildShopItemList(parentDiv)
    {
        let table = document.createElement("table");
        table.style.textAlign = "left";
        table.style.width = "300px";

        pokeMartShop.items.forEach(
            (item) =>
            {
                let tableRow = document.createElement("tr");
                table.appendChild(tableRow);
                let tableCell = document.createElement("td");
                tableRow.appendChild(tableCell);

                let firstLineDiv = document.createElement("div");

                // Buy count
                let label = document.createTextNode("Buy");
                firstLineDiv.appendChild(label);

                let buyCount = Automation.Menu.createTextInputElement(4, "[0-9]");
                buyCount.innerHTML = "10"; // TODO get the saved setting value
                firstLineDiv.appendChild(buyCount);

                let itemImage = document.createElement("img");
                if (item.imageDirectory !== undefined)
                {
                    itemImage.src = `assets/images/items/${item.imageDirectory}/${item.name}.png`;
                }
                else
                {
                    itemImage.src = `assets/images/items/${item.name}.png`;
                }
                itemImage.style.height = "25px";
                firstLineDiv.appendChild(itemImage);

                // Until count
                label = document.createTextNode("until the player has");
                firstLineDiv.appendChild(label);

                let untilCount = Automation.Menu.createTextInputElement(10, "[0-9]");
                untilCount.innerHTML = "10000"; // TODO get the saved setting value
                firstLineDiv.appendChild(untilCount);

                // Max price
                label = document.createTextNode("at max");
                firstLineDiv.appendChild(label);

                let maxPrice = Automation.Menu.createTextInputElement(10, "[0-9]");
                maxPrice.innerHTML = "10000"; // TODO get the saved setting value
                firstLineDiv.appendChild(maxPrice);

                let pokedollarsImage = document.createElement("img");
                pokedollarsImage.src = "assets/images/currency/money.svg";
                pokedollarsImage.style.height = "25px";
                firstLineDiv.appendChild(pokedollarsImage);

                tableCell.appendChild(firstLineDiv)
            });

        parentDiv.appendChild(table);
    }

    static __internal__shop()
    {
    }
}
