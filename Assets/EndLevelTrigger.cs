using UnityEngine;
using UnityEngine.SceneManagement;
public class EndLevelTrigger : MonoBehaviour
{
    private TimerManager timerManager;
    public GameObject panel;

    void Start()
    {
        timerManager = FindFirstObjectByType<TimerManager>();
        panel.SetActive(false);
    }

    void OnTriggerEnter2D(Collider2D collision)
    {
        if (collision.tag == "Player")
        {
            timerManager.EndTimer();
            //SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex + 1);
            panel.SetActive(true);
        }
    }
}