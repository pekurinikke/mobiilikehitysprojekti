using UnityEngine;
using UnityEngine.SceneManagement;

public class Projectile : MonoBehaviour
{
    public void SetDirection(float _direction){

    }
     private void OnTriggerEnter2D(Collider2D collision)
    {
        if(collision.tag == "Player")
             SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }
}
