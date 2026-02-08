class LearningModel {
    constructor() {
        this.model = null;
        this.trainingData = [];
        this.isModelBuilt = false;
    }

    buildModel(inputSize, outputSize) {
        this.model = tf.sequential();
        
        this.model.add(tf.layers.dense({
            inputShape: [inputSize],
            units: 128,
            activation: 'relu'
        }));
        
        this.model.add(tf.layers.dropout({ rate: 0.2 }));
        
        this.model.add(tf.layers.dense({
            units: 64,
            activation: 'relu'
        }));
        
        this.model.add(tf.layers.dense({
            units: outputSize,
            activation: 'softmax'
        }));

        this.model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
        
        this.isModelBuilt = true;
    }

    addTrainingData(input, output) {
        this.trainingData.push({ input, output });
    }

    async train(epochs = 50) {
        if (!this.isModelBuilt) {
            console.error("Model not built yet!");
            return;
        }

        const inputs = this.trainingData.map(d => d.input);
        const outputs = this.trainingData.map(d => d.output);

        const xs = tf.tensor2d(inputs);
        const ys = tf.tensor2d(outputs);

        await this.model.fit(xs, ys, {
            epochs: epochs,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
                }
            }
        });

        xs.dispose();
        ys.dispose();
    }

    predict(input) {
        if (!this.isModelBuilt) return null;
        const inputTensor = tf.tensor2d([input]);
        const prediction = this.model.predict(inputTensor);
        const result = prediction.dataSync();
        inputTensor.dispose();
        prediction.dispose();
        return Array.from(result);
    }

    async saveModel() {
        await this.model.save('localstorage://my-ai-model');
        console.log('Model saved!');
    }

    async loadModel() {
        try {
            this.model = await tf.loadLayersModel('localstorage://my-ai-model');
            this.isModelBuilt = true;
            console.log('Model loaded!');
        } catch (e) {
            console.log('No saved model found, use buildModel() first');
        }
    }
}
