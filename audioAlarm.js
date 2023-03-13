function audioAlarm(volume){
    return new Promise((resolve, reject) => {
        volume = volume || 100;

        try{
            // You're in charge of providing a valid AudioFile that can be reached by your web app
            let soundSource = "./alarmSound.wav";
            let sound = new Audio(soundSource);

            // Set volume
            sound.volume = volume / 100;

            sound.onended = () => {
                resolve();
            };

            sound.play();
        }catch(error){
            reject(error);
        }
    });
}