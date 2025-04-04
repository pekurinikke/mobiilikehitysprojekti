using UnityEngine;
using UnityEngine.SceneManagement;
public class EndLevelTrigger : MonoBehaviour
{
    public string sceneName;

    void OnTriggerEnter2D(Collider2D collision)
    {
        if (collision.tag == "Player"){
            SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex + 1);
        }
    }
}
