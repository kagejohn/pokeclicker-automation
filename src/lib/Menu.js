/**
 * @class The AutomationMenu regroups any utility methods used to create the GUI
 */
class AutomationMenu
{
    static TooltipSeparator = "\n─────────\n";

    static AutomationButtonsDiv;

    /**
     * @brief Builds the menu container, inside of which any automation interface element should be placed.
     *        It creates the `Automation` menu panel as well.
     *
     * Common menu management methods are available as well through this class, such as:
     *   - New category (menu group) creation
     *   - Button creation
     *   - Tooltip creation
     *   - Drop-down list creation
     *   - ...
     *
     * @param initStep: The current automation init step
     */
    static initialize(initStep)
    {
        // Only consider the BuildMenu init step
        if (initStep != Automation.InitSteps.BuildMenu) return;

        this.__internal__injectAutomationCss();

        let node = document.createElement("div");
        node.style.position = "absolute";
        node.style.top = "50px";
        node.style.right = "10px";
        node.style.width = "145px";
        node.style.textAlign = "right";
        node.style.lineHeight = "24px";
        node.style.fontFamily = 'Roboto,-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Arial,sans-serif';
        node.style.fontSize = ".875rem";
        node.style.fontWeight = "400";
        node.id = "automationContainer";
        document.body.appendChild(node);

        let boltImage = '<img src="assets/images/badges/Bolt.png" height="20px">';
        let automationTitle = `${boltImage}Automation${boltImage}`;
        this.AutomationButtonsDiv = this.addCategory("automationButtons", automationTitle);
    }

    /**
     * @brief Adds a category (menu group) to the menu container
     *
     * Such div contains two other divs:
     *   - The title div
     *   - The content div (where any element can safely be added)
     *
     * @param {string} categoryId: The id that will be given to the resulting div
     * @param {string} title: The title that will be used for the category (can contain HTML)
     *
     * @returns The content div element
     */
    static addCategory(categoryId, title)
    {
        let mainNode = document.getElementById("automationContainer");

        let newNode = document.createElement("div");
        newNode.id = categoryId;
        newNode.style.backgroundColor = "#444444";
        newNode.style.color = "#eeeeee";
        newNode.style.borderRadius = "5px";
        newNode.style.paddingTop = "5px";
        newNode.style.paddingBottom = "7px";
        newNode.style.borderColor = "#aaaaaa";
        newNode.style.borderStyle = "solid";
        newNode.style.borderWidth = "1px";
        newNode.style.marginTop = "5px";
        mainNode.appendChild(newNode);

        let contentDivId = categoryId + "Div";

        let titleDiv = document.createElement("div");
        titleDiv.innerHTML = title;
        titleDiv.style.textAlign = "center";
        titleDiv.onclick = function() { document.getElementById(contentDivId).classList.toggle('hide'); }.bind(contentDivId);
        newNode.appendChild(titleDiv);

        let contentDiv = document.createElement("div");
        contentDiv.id = contentDivId;
        contentDiv.classList.add("automationCategorie");
        newNode.appendChild(contentDiv);

        Automation.Menu.addSeparator(contentDiv);

        return contentDiv;
    }

    /**
     * @brief Adds a separator line to the given @p containingDiv
     *
     * @param {Element} containingDiv: The div element to append the separator to
     */
    static addSeparator(containingDiv = this.AutomationButtonsDiv)
    {
        let separatorDiv = document.createElement("div");
        separatorDiv.style.borderBottom = "solid #AAAAAA 1px";
        separatorDiv.style.marginBottom = "5px";
        separatorDiv.style.marginTop = "6px";
        containingDiv.appendChild(separatorDiv);
    }

    /**
     * @brief Adds an On/Off button element
     *
     * @param {string}  label: The text label to place before the button
     * @param {string}  id: The button id (that will be used for the corresponding local storage item id as well)
     * @param {string}  tooltip: The tooltip text to display upon hovering the button or the label (leave blank to disable)
     * @param {Element} containingDiv: The div element to append the button to
     * @param {boolean} forceDisabled: If set to true, the button will be turned off by default (ignoring the stored local storage value)
     *
     * @returns The button element
     */
    static addAutomationButton(label, id, tooltip = "", containingDiv = this.AutomationButtonsDiv, forceDisabled = false)
    {
        if (forceDisabled)
        {
            Automation.Utils.LocalStorage.setValue(id, false);
        }
        else
        {
            // Enable automation by default, if not already set in local storage
            Automation.Utils.LocalStorage.setDefaultValue(id, true);
        }

        let buttonMainContainer = document.createElement("span");
        containingDiv.appendChild(buttonMainContainer);
        let buttonContainer = document.createElement("div");
        buttonContainer.style.paddingLeft = "10px";
        buttonContainer.style.paddingRight = "10px";
        buttonMainContainer.appendChild(buttonContainer);

        let buttonLabel = document.createElement("span");

        if (!label.endsWith(":"))
        {
            label += " :";
        }

        buttonLabel.innerHTML = label + " ";
        buttonContainer.appendChild(buttonLabel);

        let buttonElem = this.createButtonElement(id);
        let isFeatureEnabled = (Automation.Utils.LocalStorage.getValue(id) === "true");
        buttonElem.textContent = (isFeatureEnabled ? "On" : "Off");
        buttonElem.classList.add(isFeatureEnabled ? "btn-success" : "btn-danger");
        buttonElem.onclick = function() { Automation.Menu.toggleButtonState(id) };

        if (tooltip != "")
        {
            buttonContainer.classList.add("hasAutomationTooltip");
            buttonContainer.setAttribute("automation-tooltip-text", tooltip);
        }

        buttonContainer.appendChild(buttonElem);

        return buttonElem;
    }

    /**
     * @brief Adds a toggle button element
     *
     * @param {string}  label: The text label to place before the toggle button
     * @param {string}  id: The button's id (that will be used for the corresponding local storage item id as well)
     * @param {string}  tooltip: The tooltip text to display upon hovering the button or the label (leave blank to disable)
     * @param {Element} containingDiv: The div element to append the button to
     *
     * @returns The button element
     */
    static addToggleButton(label, id, tooltip = "", containingDiv = this.AutomationButtonsDiv)
    {
        // Enable automation by default, if not already set in local storage
        Automation.Utils.LocalStorage.setDefaultValue(id, true);

        let buttonMainContainer = document.createElement("span");
        containingDiv.appendChild(buttonMainContainer);
        let buttonContainer = document.createElement("div");
        buttonContainer.style.paddingLeft = "10px";
        buttonContainer.style.paddingRight = "10px";
        buttonMainContainer.appendChild(buttonContainer);

        let buttonLabel = document.createElement("span");

        buttonLabel.innerHTML = label;
        buttonLabel.style.paddingRight = "7px";
        buttonContainer.appendChild(buttonLabel);

        let buttonElem = this.createToggleButtonElement(id);
        let isFeatureEnabled = (Automation.Utils.LocalStorage.getValue(id) === "true");
        buttonElem.setAttribute("checked", isFeatureEnabled ? "true" : "false");
        buttonElem.onclick = function()
            {
                let wasChecked = buttonElem.getAttribute("checked") == "true";
                buttonElem.setAttribute("checked", wasChecked ? "false" : "true");
                Automation.Utils.LocalStorage.setValue(id, !wasChecked);
            };

        if (tooltip != "")
        {
            buttonContainer.classList.add("hasAutomationTooltip");
            buttonContainer.classList.add("toggleAutomationTooltip");
            buttonContainer.setAttribute("automation-tooltip-text", tooltip);
        }

        buttonContainer.appendChild(buttonElem);

        return buttonElem;
    }

    /**
     * @brief Toggles the button elem between on and off based on its current state
     *        The cookie value will be updated accordingly
     *
     * @note If the button has been disabled, this function has no effect
     *
     * @param {string} id: The id of the button to toggle
     */
    static toggleButtonState(id)
    {
        let button = document.getElementById(id);
        if (button.disabled)
        {
            return;
        }

        let newStatus = !(Automation.Utils.LocalStorage.getValue(id) == "true");
        if (newStatus)
        {
            // Only update the class if the button was not disabled
            if (!button.classList.contains("btn-secondary"))
            {
                button.classList.remove("btn-danger");
                button.classList.add("btn-success");
            }
            button.innerText = "On";
        }
        else
        {
            // Only update the class if the button was not disabled
            if (!button.classList.contains("btn-secondary"))
            {
                button.classList.remove("btn-success");
                button.classList.add("btn-danger");
            }
            button.innerText = "Off";
        }

        Automation.Utils.LocalStorage.setValue(button.id, newStatus);
    }

    /**
     * @brief Forces the button status to the given @p newState
     *
     * @param {string} id: The id of the button to froce the state of
     * @param {boolean} newState: The state to force the button to (True for 'On', False for 'Off')
     */
    static forceAutomationState(id, newState)
    {
        let isEnabled = (Automation.Utils.LocalStorage.getValue(id) === "true");

        if (isEnabled !== newState)
        {
            let button = document.getElementById(id);

            // Re-enable the button so we can click on it, if needed
            let disableState = button.disabled;
            if (disableState)
            {
                button.disabled = false;
            }

            button.click();

            button.disabled = disableState;
        }
    }

    /**
     * @brief Creates a drop-down list (select) element
     *
     * @param {string} id: The select id
     *
     * @returns The created element (It's the caller's responsibility to add it to the DOM at some point)
     */
    static createDropDownListElement(id)
    {
        let newSelect = document.createElement("select");
        newSelect.className = "custom-select";
        newSelect.name = id;
        newSelect.id = id;
        newSelect.style.width = "calc(100% - 10px)";
        newSelect.style.borderRadius = "4px";
        newSelect.style.marginTop = "3px";
        newSelect.style.paddingTop = "0px";
        newSelect.style.paddingBottom = "0px";
        newSelect.style.height = "25px";

        return newSelect;
    }

    /**
     * @brief Creates a button element
     *
     * @param {string} id: The button id
     *
     * @returns The created button element (It's the caller's responsibility to add it to the DOM at some point)
     */
    static createButtonElement(id)
    {
        // Create as a span to avoid the glowing effect on click
        let newButton = document.createElement("span");
        newButton.id = id;
        newButton.classList.add("btn");
        newButton.style.width = "30px";
        newButton.style.height = "20px";
        newButton.style.padding = "0px";
        newButton.style.borderRadius = "4px";
        newButton.style.position = "relative";
        newButton.style.bottom = "1px";
        newButton.style.fontFamily = 'Roboto,-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Arial,sans-serif';
        newButton.style.fontSize = ".875rem";
        newButton.style.fontWeight = "400";
        newButton.style.lineHeight = "20px";
        newButton.style.verticalAlign = "middle";

        return newButton;
    }

    /**
     * @brief Creates a toggle button element
     *
     * @param {string} id: The button id
     *
     * @returns The created toggle button element (It's the caller's responsibility to add it to the DOM at some point)
     */
    static createToggleButtonElement(id)
    {
        let toggleButton = document.createElement("span");
        toggleButton.id = id;
        toggleButton.classList.add("automation-toggle-button");

        return toggleButton;
    }

    /**
     * @brief Creates a title element
     *
     * @param {string} titleText: The text to display
     *
     * @returns The created element (It's the caller's responsibility to add it to the DOM at some point)
     */
    static createTitleElement(titleText)
    {
        let titleDiv = document.createElement("div");
        titleDiv.style.textAlign = "center";
        titleDiv.style.marginBottom = "3px";
        let titleSpan = document.createElement("span");
        titleSpan.textContent = titleText;
        titleSpan.style.borderRadius = "4px";
        titleSpan.style.borderWidth = "1px";
        titleSpan.style.borderColor = "#aaaaaa";
        titleSpan.style.borderStyle = "solid";
        titleSpan.style.display = "block";
        titleSpan.style.marginLeft = "10px";
        titleSpan.style.marginRight = "10px";
        titleSpan.style.paddingLeft = "10px";
        titleSpan.style.paddingRight = "10px";
        titleDiv.appendChild(titleSpan);

        return titleDiv;
    }

    /**
     * @brief Creates an editable text field element
     *
     * @param {number} charLimit
     * @param {string} acceptedRegex
     *
     * @returns The created element's container (It's the caller's responsibility to add it to the DOM at some point)
     */
    static createTextInputElement(charLimit = -1, acceptedRegex = "")
    {
        // Add the input
        let inputElem = document.createElement("div");
        inputElem.contentEditable = true;
        inputElem.spellcheck = false;
        inputElem.classList.add("automation-setting-input");

        // Filter input based on the given parameters
        inputElem.onkeydown = function(event)
        {
            let isValidKey = (acceptedRegex === "") || (event.key.match(acceptedRegex) != null);

            return (event.key === "Backspace")
                   || (event.key === "Delete")
                   || (event.key === "ArrowLeft")
                   || (event.key === "ArrowRight")
                   || (isValidKey && ((charLimit == -1) || (this.innerText.length < charLimit)));
        };

        // Disable drag and drop
        inputElem.ondrop = function(event) { event.preventDefault(); event.dataTransfer.dropEffect = 'none'; return false; };

        return inputElem;
    }

    /**
     * @brief Adds an hideable panel where additional settings can be added
     *
     * @param {Element} elemDiv: The html element to add a settings panel next to
     *
     * @returns The newly created settings panel container
     */
    static addSettingPanel(elemDiv)
    {
        let placeholderDiv = document.createElement("div");
        placeholderDiv.classList.add("automation-setting-placeholder");
        placeholderDiv.style.position = "relative";
        placeholderDiv.style.width = "0px";
        placeholderDiv.style.height = "0px";

        let panelContainer = document.createElement("div");
        panelContainer.style.position = "absolute";
        panelContainer.style.top = "calc(-30px)";
        panelContainer.style.right = "calc(100% - 10px)";
        placeholderDiv.appendChild(panelContainer);

        let innerDiv = document.createElement("div");
        innerDiv.classList.add("automation-setting-menu-container");
        panelContainer.appendChild(innerDiv);

        let settingsContainerDiv = document.createElement("div");
        settingsContainerDiv.style.whiteSpace = "nowrap";
        innerDiv.appendChild(settingsContainerDiv);

        let buttonContainerDiv = document.createElement("div");
        buttonContainerDiv.classList.add("automation-arrow-container-div");
        settingsContainerDiv.appendChild(buttonContainerDiv)

        let buttonDiv = document.createElement("div");
        buttonDiv.classList.add("automation-arrow-div");
        buttonContainerDiv.appendChild(buttonDiv)

        let arrowDiv = document.createElement("div");
        arrowDiv.classList.add("automation-arrow");
        buttonDiv.appendChild(arrowDiv);

        // Add onclick action
        buttonContainerDiv.onclick = function()
            {
                let allSettingsPanels = document.getElementsByClassName("automation-setting-placeholder");

                if (!innerDiv.hasAttribute("automation-visible"))
                {
                    innerDiv.setAttribute("automation-visible", "true");
                    arrowDiv.classList.add("right");

                    // Hide all other settings panels
                    Array.from(allSettingsPanels).forEach((el) => { el.setAttribute("automation-visible", "false"); });
                    placeholderDiv.removeAttribute("automation-visible");
                }
                else
                {
                    innerDiv.removeAttribute("automation-visible");
                    arrowDiv.classList.remove("right");

                    // Show all settings panels
                    Array.from(allSettingsPanels).forEach((el) => { el.removeAttribute("automation-visible"); });
                }
            };

        elemDiv.appendChild(placeholderDiv);

        let settingsContentDiv = document.createElement("div");
        settingsContentDiv.style.display = "inline-block";
        settingsContentDiv.style.paddingTop = "5px";
        settingsContentDiv.style.paddingBottom = "5px";
        settingsContentDiv.style.paddingLeft = "15px";
        settingsContentDiv.style.paddingRight = "10px";
        settingsContainerDiv.appendChild(settingsContentDiv);

        return settingsContentDiv;
    }

    /**
     * @brief Sets the disable state of the given button
     *
     * A disabled button will be greyed-out and its clic action will be inhibited
     * If the button is already in the @p newState, nothing will happen
     *
     * @param {string}  id: The button id
     * @param {boolean} newState: If set to True the button is disable, otherwise it's re-enabled
     * @param {string}  reason: The reason for disabling the button to display in the tooltip
     *
     * @todo Disable both button using the same attribute
     */
    static setButtonDisabledState(id, newState, reason = "")
    {
        let button = document.getElementById(id);
        if (button.classList.contains("automation-toggle-button"))
        {
            this.__internal__disableToggleButton(button, newState, reason);
        }
        else
        {
            this.__internal__disableOnOffButton(button, newState, reason);
        }
    }

    /*********************************************************************\
    |***    Internal members, should never be used by other classes    ***|
    \*********************************************************************/

    /**
     * @brief Disables the given toggle @p button and updates its theme accordingly
     *
     * @param {Element} button: The toggle button to disable
     * @param {boolean} newState: If set to True the button is disable, otherwise it's re-enabled
     * @param {string}  reason: The reason for disabling the button to display in the tooltip
     */
    static __internal__disableToggleButton(button, newState, reason)
    {
        let wasDisabled = button.getAttribute("disabled") == "true";

        if (wasDisabled === newState)
        {
            // Nothing to do
            return;
        }

        button.setAttribute("disabled", newState ? "true" : "false");

        if (newState &&  (reason !== ""))
        {
            button.parentElement.setAttribute("automation-tooltip-disable-reason", "\n" + reason + this.TooltipSeparator);
        }
        else
        {
            button.parentElement.removeAttribute("automation-tooltip-disable-reason");
        }
    }

    /**
     * @brief Disables the given On/Off @p button and updates its theme accordingly
     *
     * @param {Element} button: The On/Off button to disable
     * @param {boolean} newState: If set to True the button is disable, otherwise it's re-enabled
     * @param {string}  reason: The reason for disabling the button to display in the tooltip
     */
    static __internal__disableOnOffButton(button, newState, reason)
    {
        if (button.disabled === newState)
        {
            // Nothing to do
            return;
        }

        button.disabled = newState;
        if (newState)
        {
            button.classList.remove((Automation.Utils.LocalStorage.getValue(button.id) === "true") ? "btn-success" : "btn-danger");
            button.classList.add("btn-secondary");

            if (reason !== "")
            {
                button.parentElement.setAttribute("automation-tooltip-disable-reason", "\n" + reason + this.TooltipSeparator);
            }
            else
            {
                button.parentElement.removeAttribute("automation-tooltip-disable-reason");
            }
        }
        else
        {
            button.classList.add((Automation.Utils.LocalStorage.getValue(button.id) === "true") ? "btn-success" : "btn-danger");
            button.classList.remove("btn-secondary");
            button.parentElement.removeAttribute("automation-tooltip-disable-reason");
        }
    }

    /**
     * @brief Injects the automation menu css to the document heading
     */
    static __internal__injectAutomationCss()
    {
        /*
         * The 'Disabled for the following reason' colored title was geneted using https://yoksel.github.io/url-encoder/
         * With the following SVG code:
         *    <svg xmlns='http://www.w3.org/2000/svg' width='207' height='20'>
         *        <text x='0' y='17' style='fill: #f24444; font-weight: 600; font-size:.900rem;'>Disabled for the following reason:</text>
         *    </svg>
         */

        const style = document.createElement('style');
        style.textContent = `
            .hasAutomationTooltip
            {
                position: relative;
            }
            .hasAutomationTooltip::before
            {
                content: attr(automation-tooltip-text);
                white-space: pre;
                line-height: normal;
                position: absolute;
                left: calc(100% + 5px);
                transform: translateX(-100%);
                top: calc(100% + 6px);
                padding: 5px 10px;
                border-radius: 5px;
                background-color: #222222;
                color: #eeeeee;
                text-align: center;
                opacity: 0;
                z-index: 9;
                pointer-events: none;
            }
            .hasAutomationTooltip[automation-tooltip-disable-reason]::before
            {
                content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='207' height='20'%3E%3Ctext x='0' y='17' style='fill:%23f24444; font-weight: 600; font-size:.900rem;'%3EDisabled for the following reason:%3C/text%3E%3C/svg%3E")
                         attr(automation-tooltip-disable-reason)
                         attr(automation-tooltip-text);
            }
            .hasAutomationTooltip::after
            {
                content: "";
                position: absolute;
                top: 100%;
                margin-top: -4px;
                left: calc(100% - 30px);
                border: 5px solid #222222;
                border-color: transparent transparent #222222 transparent;
                opacity: 0;
                z-index: 9;
                pointer-events: none;
            }
            .hasAutomationTooltip:hover::before, .hasAutomationTooltip:hover::after
            {
                transition-delay: 2s;
                transition-duration:.3s;
                transition-property: opacity;
                opacity: 1;
            }
            .hasAutomationTooltip.centeredAutomationTooltip::after
            {
                left: calc(50%);
            }
            .hasAutomationTooltip.gotoAutomationTooltip::after
            {
                left: calc(100% - 85px);
            }
            .hasAutomationTooltip.toggleAutomationTooltip::after
            {
                top: calc(100% - 4px);
            }
            .hasAutomationTooltip.toggleAutomationTooltip::before
            {
                top: calc(100% + 2px);
            }
            .automationCategorie
            {
                max-height: 500px;
                display: block;
            }
            .automationCategorie.hide
            {
                max-height: 0px;
                display: none;
            }
            .automation-setting-placeholder
            {
                position: relative;
                width: 0px;
                height: 0px;
                visibility: visible;
                opacity: 100%;

                transition: opacity 1s ease-out;
            }
            .automation-setting-placeholder[automation-visible]
            {
                opacity: 0%;
                pointer-events: none;

                transition: opacity 1s ease-in;

                /* Delay the visibility change after the entire animation */
                animation: 1s automation-delay-visibility forwards;
            }
            @keyframes automation-delay-visibility
            {
                to
                {
                    visibility: hidden;
                }
            }
            .automation-arrow
            {
                position: relative;
                top: 15px;
                left: 4px;
                width: 7px;
                height: 7px;
                border: 2px solid;
                border-color: #cccccc transparent transparent #cccccc;
                transform: rotate(-45deg);
                transition: transform 2s, left 2s;
            }
            .automation-arrow.right
            {
                transform: rotate(135deg);
                transition: transform 2s, left 2s;
                left: calc(-1px);
            }
            .automation-setting-menu-container
            {
                white-space: pre;
                text-overflow: clip;
                overflow: clip;
                background-color: #2b3548;
                border-color: #aaaaaa;
                border-style: solid;
                border-width: 1px;
                margin-right: 10px;
                border-bottom-left-radius: 5px;
                min-width: 0px;
                max-width: 0px;
                min-height: 37px;
                max-height: 37px;

                transition-property:        max-height, max-width;
                transition-timing-function:  ease-out,   ease-out;
                transition-duration:               1s,         1s;
                transition-delay:                  0s,      500ms;
            }
            .automation-setting-menu-container[automation-visible]
            {
                max-width: 500px;
                max-height: 500px;

                transition-property:        max-width, max-height;
                transition-timing-function:   ease-in,    ease-in;
                transition-duration:               1s,         1s;
                transition-delay:                  0s,      500ms;

                /* Delay the overflow change after the entire animation */
                animation: 6s automation-delay-overflow forwards;
            }
            @keyframes automation-delay-overflow
            {
                to
                {
                    text-overflow: unset;
                    overflow: unset;
                }
            }
            .automation-arrow-container-div
            {
                cursor: pointer;
                position: absolute;
                top: 0px;
                right: calc(100% - 12px);
                width: 30px;
                height: 40px;
            }
            .automation-arrow-div
            {
                position: absolute;
                top: 0px;
                left: calc(100% - 18px);
                height: 37px;
                width: 12px;
                background-color: #444444;
                border-color: #aaaaaa;
                border-style: solid;
                border-width: 1px;
                border-top-left-radius: 5px;
                border-bottom-left-radius: 5px;
                transition: left 0.3s;
            }
            .automation-arrow-container-div:hover .automation-arrow-div
            {
                left: calc(100% - 20px);
                background-color: #555555;
                transition: left 0.3s;
            }
            .automation-toggle-button
            {
                box-sizing: border-box;
                cursor: pointer;
                top: 4px;

                height: 18px;
                width: 32px;
                border-radius: 16px;
                display: inline-block;
                position: relative;
                border: 2px solid #474755;
                background-color: #070C31;
                transition: all 0.2s cubic-bezier(0.5, 0.1, 0.75, 1.35);
            }
            .automation-toggle-button::before
            {
                content: "";
                position: absolute;
                bottom: calc(50% - 1px);
                left: 4px;
                width: calc(100% - 10px);
                height: 0px;
                border: solid 1px #999999;
                border-radius: 50%;
                transition: border-color 500ms;
            }
            .automation-toggle-button::after
            {
                content: "";
                position: absolute;
                top: 2px;
                left: 2px;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background-color: #999999;
                box-shadow: inset -1px -1px 2px #111111;
                transition: all 0.2s cubic-bezier(0.5, 0.1, 0.75, 1.35);
            }
            .automation-toggle-button[checked=true]
            {
                border-color: #86d02c;
            }
            .automation-toggle-button[checked=true]::before
            {
                border-color: #467546;
                transition: border-color 500ms;
            }
            .automation-toggle-button[checked=true]::after
            {
                transform: translateX(14px);
                background-color: #8bff00;
            }
            .automation-toggle-button[disabled=true]
            {
                pointer-events: none;
                border-color: #467546;
                transition: all 500ms;
                border-color: #950606;
            }
            .automation-toggle-button[disabled=true]::before, .automation-toggle-button[disabled=true]::after
            {
                width: 24px;
                height: 2px;
                background-color: #FF0000;
                border-radius: 2px;
            }
            .automation-toggle-button[disabled=true]::before
            {
                border-width: 0px;
                box-shadow: inset -1px -1px 2px #111111;
                transform: rotate(20deg);
                left: 2px;
            }
            .automation-toggle-button[disabled=true]::after
            {
                border-width: 0px;
                box-shadow: inset -1px -1px 2px #111111;
                transform: rotate(-20deg);
                right: 2px;
                top: 6px;
            }
            .automation-setting-input
            {
                display: inline-block;
                border-bottom: solid 1px #CCCDD9;
                border-radius: 5px;
                padding: 0px 5px;
                margin: 0px 5px;
                min-width: 20px;
                user-select: text !important;
                background-color: #3c5071;
            }
            .automation-setting-input:focus
            {
                outline: none;
                border-radius: 5px;
                background-color: #455d77;
            }`;
        document.head.append(style);
    }
}
