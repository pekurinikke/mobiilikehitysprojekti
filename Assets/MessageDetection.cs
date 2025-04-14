using UnityEngine;
using UnityEngine.UI;

public class MessageDetection : MonoBehaviour
{
    [SerializeField] private GameObject floatingText;
    private void OnTrigger2D(Collider2D collision)
    {
        if (collision.tag == "Player"){
            Debug.LogError("Detected");
        }
    }
}
