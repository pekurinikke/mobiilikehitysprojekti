using UnityEngine;

public class TimerManager : MonoBehaviour
{
    private FirestoreManager firestoreManager;
    private float startTime;
    private string playerName;

    void Start()
    {
        firestoreManager = FindFirstObjectByType<FirestoreManager>();
        playerName = "Test Player";
        StartTimer();
    }

    void StartTimer()
    {
        // Hurja lause, mutta unityssa on siis Time.time joka laskee aikaa näppärästi.
        startTime = Time.time;
    }

    public void EndTimer()
    {
        float elapsedTime = Time.time - startTime;
        Debug.Log($"Completed level in: {FormatTime(elapsedTime)}");

        firestoreManager.SavePlayerData(playerName, elapsedTime);
    }

    private string FormatTime(float time)
    {
        int minutes = Mathf.FloorToInt(time / 60);
        int seconds = Mathf.FloorToInt(time % 60);
        return $"{minutes:D2}:{seconds:D2}";
    }

}
