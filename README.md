# Description

Ce projet consiste à développer une application mobile de reconnaissance et de classification d'objets en temps réel, utilisant des techniques de vision par ordinateur et d'apprentissage profond. L'application, développée avec le framework Ionic Angular et TensorFlow.js, permet de capturer des images ou de filmer des vidéos en direct pour identifier et classer des objets à l'aide de modèles pré-entraînés tels que MobileNet SSD et cocoSsd. L'application intègre également une fonctionnalité d'apprentissage personnalisé pour améliorer la reconnaissance d'objets spécifiques.

# Fonctionnalités Requises

1. **Acquisition d'images** :
   - Utilisation de la caméra du téléphone pour capturer des images ou des vidéos en temps réel.
   - Possibilité d'importer des images depuis la galerie de l'utilisateur.

2. **Reconnaissance d'objets** :
   - Implémentation de modèles de reconnaissance d'objets pré-entraînés (ex. MobileNet, SSD, cocoSsd) pour identifier et classer les objets dans une image ou une vidéo.
   - Affichage des résultats en temps réel avec des cadres autour des objets détectés et les noms des objets reconnus.

3. **Base de données de catégories** :
   - Utilisation ou création d'une base de données de catégories d'objets (véhicules, animaux, articles ménagers, etc.).
   - Ajout de nouvelles catégories.

4. **Apprentissage personnalisé** :
   - Implémentation d'une fonctionnalité permettant aux utilisateurs d’entraîner le modèle avec leurs propres images pour améliorer la reconnaissance de certains objets spécifiques (Panneaux de signalisation routier).

5. **Interface utilisateur** :
   - Interface intuitive pour capturer des images, afficher les résultats de la classification, et consulter l'historique des reconnaissances effectuées.
   - Visualisation des prédictions sous forme de pourcentage de confiance pour chaque objet reconnu.

6. **Fonctionnalités supplémentaires** :
   - Option de sauvegarder les résultats (images avec les objets reconnus et classés) pour une consultation ultérieure.
   - Intégration avec une base de données en ligne pour stocker les résultats et permettre le partage entre les utilisateurs.

# Technologies utilisées

- **Ionic Framework** (Angular) : Développement d'applications mobiles multiplateformes.
- **TensorFlow.js** : Framework de machine learning pour la reconnaissance d'objets.
- **MobileNet SSD**, **cocoSsd** : Modèles pré-entraînés pour la détection d'objets.
- **Firebase / Supabase** : Base de données en temps réel et stockage des données.

# Installation

1. Clonez ce repository sur votre machine locale :
   ```bash
   git clone https://github.com/EliottMuller/IonicProject.git
   ```

2. Installez les dépendances nécessaires :
   ```bash
   npm install
   ```

3. Lancez l'application en mode développement :
   ```bash
   ionic serve
   ```
