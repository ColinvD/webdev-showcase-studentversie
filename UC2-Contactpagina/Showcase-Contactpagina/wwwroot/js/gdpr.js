class GDPR {

    constructor() {
        //this.showStatus();
        //this.showContent();
        this.bindEvents();

        if (this.cookieStatus() !== 'accept') this.showGDPR();
    }

    bindEvents() {
        let buttonAccept = document.querySelector('.gdpr-consent__button--accept');
        buttonAccept.addEventListener('click', () => {
            this.cookieStatus('accept');
            //this.showStatus();
            //this.showContent();
            this.hideGDPR();
        });


        //student uitwerking
        let buttonDeny = document.querySelector('.gdpr-consent__button--reject');
        buttonDeny.addEventListener('click', () => {
            this.cookieStatus('reject');
            //this.showStatus();
            //this.showContent();
            this.hideGDPR();
        });

    }

    showContent() {
        this.resetContent();
        const status = this.cookieStatus() == null ? 'not-chosen' : this.cookieStatus();
        const element = document.querySelector(`.content-gdpr-${status}`);
        element.classList.add('show');

    }

    resetContent() {
        const classes = [
            '.content-gdpr-accept',

            //student uitwerking
            '.content-gdpr-reject',
            '.content-gdpr-not-chosen'];

        for (const c of classes) {
            document.querySelector(c).classList.add('hide');
            document.querySelector(c).classList.remove('show');
        }
    }

    showStatus() {
        document.getElementById('content-gpdr-consent-status').innerHTML =
            this.cookieStatus() == null ? 'Niet gekozen' : this.cookieStatus();
    }

    cookieStatus(status) {

        if (status) {
            localStorage.setItem('gdpr-consent-choice', status);

            let stringObj = JSON.stringify(this.metaData());
            localStorage.setItem('gdpr-consent-datetime', stringObj);
        }

        //student uitwerking
        return localStorage.getItem('gdpr-consent-choice');
    }

    //student uitwerking

    metaData() {
        const date = new Date();
        let dayFormat = "" + date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
        let timeFormat = "" + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
        let object = { datum: dayFormat, tijd: timeFormat }
        return object;
    }

    hideGDPR() {
        document.querySelector(`.gdpr-consent`).classList.add('hide');
        document.querySelector(`.gdpr-consent`).classList.remove('show');
    }

    showGDPR() {
        document.querySelector(`.gdpr-consent`).classList.add('show');
    }

}

const gdpr = new GDPR();

