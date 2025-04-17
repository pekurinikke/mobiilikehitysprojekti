using UnityEngine;
using UnityEngine.SceneManagement;
public class EndLevelTrigger : MonoBehaviour
{
    private TimerManager timerManager;

    void Start()
    {
        timerManager = FindFirstObjectByType<TimerManager>();
    }

    void OnTriggerEnter2D(Collider2D collision)
    {
        if (collision.tag == "Player")
        {
            timerManager.EndTimer();
            SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex + 1);
        }
    }
}