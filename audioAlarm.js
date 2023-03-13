function audioAlarm(volume){
    return new Promise((resolve, reject) => {
        volume = volume || 100;

        try{
            let soundSource = "./alarmSound.wav";
            let sound = new Audio(soundSource);
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