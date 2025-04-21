using UnityEngine;
using System.Collections.Generic;

public static class FirestoreDataParser
{
    public static void ProcessFirestoreJson(string json)
    {
        Debug.Log("Process called!");
        Debug.Log($"Raw JSON: {json}");

        // Poista rivinvaihdot ja yhtenäistä JSON-muoto
        json = json.Replace("\n", "").Replace("\r", "");

        // Etsi "documents" osuus JSON:sta
        int docStart = json.IndexOf("\"documents\": [");
        if (docStart == -1)
        {
            Debug.LogError("No documents found in Firestore JSON!");
            return;
        }

        int docEnd = json.IndexOf("]", docStart); 
        string documentsData = json.Substring(docStart + 13, docEnd - (docStart + 13));

        // Pilkotaan dokumentit oikealla tavalla
        string[] individualDocs = documentsData.Split(new string[] { "{\"name\":" }, System.StringSplitOptions.RemoveEmptyEntries);
        Debug.Log($"Found {individualDocs.Length} documents");

        foreach (string doc in individualDocs)
        {
            // Etsitään pelaajan nimi
            int nameIndex = doc.IndexOf("\"stringValue\": \"") + 15;
            if (nameIndex < 15) continue; // Jos nimeä ei löydy, ohitetaan tämä dokumentti
            int nameEnd = doc.IndexOf("\"", nameIndex);
            string playerName = doc.Substring(nameIndex, nameEnd - nameIndex);

            // Etsitään pelaajan aika
            int timeIndex = doc.IndexOf("\"doubleValue\": ") + 14;
            if (timeIndex < 14) continue; // Jos aikaa ei löydy, ohitetaan tämä dokumentti
            int timeEnd = doc.IndexOf("}", timeIndex);
            string timeString = doc.Substring(timeIndex, timeEnd - timeIndex);
            float playerTime = float.Parse(timeString, System.Globalization.CultureInfo.InvariantCulture);

            Debug.Log($"Player: {playerName}, Time: {playerTime}");
        }
    }
}





