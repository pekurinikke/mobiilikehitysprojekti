using UnityEngine;
using UnityEngine.Networking;
using System.Collections;

public class FirestoreManager : MonoBehaviour
{
    private string firestoreBaseUrl = "https://firestore.googleapis.com/v1/projects/mobiilikehitysprojekti-75ad6/databases/(default)/documents/players";

    void Start()
    {
        //SavePlayerData("Test Player", 220.0f);
    }

    public void SavePlayerData(string playerName, float time)
    {
        StartCoroutine(CheckAndUpdatePlayer(playerName, time));
    }

    // Tarkistaa onko pelaajan nimellä jo tallennettu aika
    IEnumerator CheckAndUpdatePlayer(string playerName, float time)
    {
        string playerUrl = $"{firestoreBaseUrl}/{playerName}";
        UnityWebRequest getRequest = UnityWebRequest.Get(playerUrl);
        yield return getRequest.SendWebRequest();

        if (getRequest.result == UnityWebRequest.Result.Success)
        {
            float existingTime = ExtractTimeFromJson(getRequest.downloadHandler.text);

            // Päivittää tuloksen databasessa vain jos aika on parempi kuin aikaisempi talletus
            if (time < existingTime)
            {
                yield return SendPatchRequest(playerUrl, time);
            }
        }
        else
        {
            yield return SendPostRequest(playerName, time);
        }
    }

    // Tämä kutsutaan mikäli pelaajalla on aikaisempi data tietokannassa
    IEnumerator SendPatchRequest(string url, float time)
    {
        string jsonUpdate = "{ \"fields\": { \"time\": { \"doubleValue\": " + time + " } } }";

        // Unity WebRequest sähläystä, lähetetään json data REST API:n avulla firestoreen
        UnityWebRequest request = new UnityWebRequest(url, "PATCH");
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonUpdate);
        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();
        Debug.Log(request.result == UnityWebRequest.Result.Success ? "Player time updated" : "Something went wrong: " + request.error);
    }

    // Tämä kutsutaan mikäli pelaajalla ei ole aikaisempaa dataa
    IEnumerator SendPostRequest(string playerName, float time)
    {
        string playerUrl = $"{firestoreBaseUrl}?documentId={playerName}";
        string jsonCreate = "{ \"fields\": { \"name\": { \"stringValue\": \"" + playerName + "\" }, \"time\": { \"doubleValue\": " + time + " } } }";

        UnityWebRequest request = new UnityWebRequest(playerUrl, "POST");
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonCreate);
        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();
        Debug.Log(request.result == UnityWebRequest.Result.Success ? "New player data added" : "Something went wrong:" + request.error);
    }

    private float ExtractTimeFromJson(string json)
    {
        int index = json.IndexOf("\"doubleValue\":") + 14;
        int endIndex = json.IndexOf("}", index);
        string timeString = json.Substring(index, endIndex - index);
        return float.Parse(timeString);
    }
}
